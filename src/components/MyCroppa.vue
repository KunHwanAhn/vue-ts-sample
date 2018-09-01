<template>
  <div class="main-container">
    <div v-show="!accessToken"
         class="google-access-container">
      <a target="_blank" :href="codeUrl">Click to get Google OAuth2 code</a>
      <div>
        <label for="authorizationCode">Enter OAuth Code</label>
        <input type="text" v-model="authorizationCode" name="authorizationCode">
        <button  v-stream:click="exchangeAccessToken$">Get access token</button>
      </div>
    </div>

    <div v-show="accessToken"
         class="image-uploader-container">
      <div class="image-limitation-noti-container"
          :style="{ width: `${croppaOpts.width}px`}">
        <span>
          ({{ IMAGE_MAX_WIDTH }}px * {{ IMAGE_MAX_HEIGHT }}px / {{ croppaOpts.fileSizeLimit / 1024 / 1024 }}MB미만)
        </span>
      </div>

      <div class="my-croppa-container">
        <croppa v-model="myCroppa"
                :width="croppaOpts.width"
                :height="croppaOpts.height"
                :accept="croppaOpts.fileTypes"
                :file-size-limit="croppaOpts.fileSizeLimit"
                :remove-button-size="croppaOpts.removeButtonSize"
                :initial-size="croppaOpts.initialImageSize"
                :show-loading="croppaOpts.showLoading"
                :disable-click-to-choose="croppaOpts.disableClickToChoose"
                placeholder=""
                @file-size-exceed="onFileSizeExceeded"
                @new-image-drawn="onImageChosen"
                @image-remove="onImageRemoved"
                @zoom="onZoomed">
        </croppa>
      </div>

      <div class="button-group-container">
        <div v-show="!isImageChosen"
            class="button-group">
          <button v-stream:click="chooseTarget$">
            Choose Image
          </button>
        </div>

        <div v-show="isImageChosen"
            class="image-control-group-container">
          <div class="image-resize-control-container">
            <input type="range"
                  step="0.01"
                  v-model="zoomSliderValue"
                  :min="zoomSliderMin"
                  :max="zoomSliderMax">
          </div>

          <div class="button-group">
            <button v-stream:click="zoomIn$">
              Zoom In
            </button>
            <button v-stream:click="zoomOut$">
              Zoom Out
            </button>
            <button v-stream:click="cancelUpload$">
              Cancel
            </button>
            <button v-stream:click="uploadImage$">
              Upload
            </button>
          </div>
        </div>
      </div>

      <div class="image-container">
        <div v-show="isImageChosen && isImageUploading"
             class="loader">
        </div>
        <img class="output" :src="imgUrl">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Croppa from 'vue-croppa';
import 'vue-croppa/dist/vue-croppa.css';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import axios from 'axios';
import appConfig from '../../config/index';

Vue.use(Croppa);

const IMAGE_MAX_WIDTH = 150;
const IMAGE_MAX_HEIGHT = 150;

function isClickEvent(mouseEvent: Object): boolean {
  return _.get(mouseEvent, 'event.type') === 'click'
}

export default Vue.extend({
  data() {
    return {
      croppaOpts: {
        width: 400,
        height: 300,
        fileTypes: '.png,.jpeg',
        fileSizeLimit: 1024 * 1024,
        removeButtonSize: 20,
        initialImageSize: 'natural',
        showLoading: true,
        disableClickToChoose: true
      },
      oAuthInfo: _.get(appConfig, 'oAuthInfo', {}),
      codeBaseUrl: _.get(appConfig, 'codeBaseUrl'),
      tokenBaseUrl: _.get(appConfig, 'tokenBaseUrl'),
      uploadBaseUrl: _.get(appConfig, 'uploadBaseUrl'),
      IMAGE_MAX_WIDTH,
      IMAGE_MAX_HEIGHT,
      myCroppa: null,
      imgUrl: '',
      zoomSliderValue: 0,
      zoomSliderMin: 0,
      zoomSliderMax: 0,
      isImageChosen: false,
      isImageUploading: false,
      authorizationCode: '',
      accessToken: '',
      chooseTarget$: new Subject(),
      zoomIn$: new Subject(),
      zoomOut$: new Subject(),
      cancelUpload$: new Subject(),
      uploadImage$: new Subject(),
      exchangeAccessToken$: new Subject()
    }
  },
  computed: {
    codeUrl(): string {
      return `${this.codeBaseUrl}?access_type=offline&scope=${this.oAuthInfo.scopes}&response_type=code&client_id=${this.oAuthInfo.clientId}&redirect_uri=${this.oAuthInfo.redirectUri}`;
    }
  },
  methods: {
    onFileSizeExceeded(file: any): void {
      alert(`Size of ${file.name} is over than ${this.croppaOpts.fileSizeLimit / 1024}Kbyte`);
    },
    onZoomed(): void {
      let scaleRatio = _.get(this.myCroppa, 'scaleRatio');

      if (_.isUndefined(scaleRatio)) {
        return;
      }

      if (+scaleRatio < this.zoomSliderMin) {
        scaleRatio = this.zoomSliderMin;
        _.set(this.myCroppa, 'scaleRatio', scaleRatio);
      }

      if (+scaleRatio > this.zoomSliderMax) {
        scaleRatio = this.zoomSliderMax;
        _.set(this.myCroppa, 'scaleRatio', scaleRatio);
      }

      this.zoomSliderValue = +scaleRatio;
    },
    onImageRemoved(): void {
      this.isImageChosen = false;
      this.zoomSliderValue = 0;
      this.zoomSliderMin = 0;
      this.zoomSliderMax = 0;
    },
    onImageChosen(): void {
      let imageInfo = _.get(this.myCroppa, 'imgData');
      let scaleRatio = _.get(this.myCroppa, 'scaleRatio');

      if (_.isUndefined(imageInfo)) {
        alert(`Failed to get information of the chosen image`);
        this.$data.myCroppa.remove();

        return;
      }

      if (_.get(imageInfo, 'width') > this.IMAGE_MAX_WIDTH) {
        alert(`Width is over than ${this.IMAGE_MAX_WIDTH}px`);
        this.$data.myCroppa.remove();

        return;
      }

      if (_.get(imageInfo, 'height') > this.IMAGE_MAX_HEIGHT) {
        alert(`Height is over than ${this.IMAGE_MAX_HEIGHT}px`);
        this.$data.myCroppa.remove();

        return;
      }

      this.imgUrl = '';
      this.isImageChosen = true;
      this.zoomSliderValue = +scaleRatio;
      this.zoomSliderMin = +scaleRatio / 2;
      this.zoomSliderMax = +scaleRatio * 4;
    }
  },
  subscriptions() {
    return {
      chooseTarget: this.$data.chooseTarget$.pipe(
        map(event => {
          if (isClickEvent(event)) {
            this.$data.myCroppa.chooseFile();
          }
        })
      ),
      zoomIn: this.$data.zoomIn$.pipe(
        map(event => {
          let scaleRatio;
          let zoomSliderMax;

          if (isClickEvent(event)) {
            zoomSliderMax = _.get(this.$data, 'zoomSliderMax');
            scaleRatio = _.get(this.$data.myCroppa, 'scaleRatio');

            if (+scaleRatio < zoomSliderMax) {
              this.$data.myCroppa.zoomIn();
            }
          }
        })
      ),
      zoomOut: this.$data.zoomOut$.pipe(
        map(event => {
          let scaleRatio;
          let zoomSliderMin;

          if (isClickEvent(event)) {
            zoomSliderMin = _.get(this.$data, 'zoomSliderMin');
            scaleRatio = _.get(this.$data.myCroppa, 'scaleRatio');

            if (+scaleRatio > zoomSliderMin) {
              this.$data.myCroppa.zoomOut();
            }
          }
        })
      ),
      cancelUpload: this.$data.cancelUpload$.pipe(
        map(event => {
          if (isClickEvent(event)) {
            this.$data.myCroppa.remove();
            this.$data.isImageChosen = false;
          }
        })
      ),
      uploadImage: this.$data.uploadImage$.pipe(
        map(event => {
          if (isClickEvent(event)) {
            let url = this.$data.myCroppa.generateDataUrl();
            _.set(this.$data, 'isImageUploading', true);

            this.$data.myCroppa.generateBlob((blob: any) => {
              const baseURI = _.get(this.$data, 'uploadBaseUrl');
              const accessToken = _.get(this.$data, 'accessToken');

              axios({
                method: 'post',
                url:baseURI,
                data: blob,
                headers: {
                  'Content-Type': blob.type,
                  Authorization: accessToken
                }
              }).then((result) => {
                _.set(this.$data, 'isImageUploading', false);
                alert('Successfully uploaded on the Google dirve');
                this.$data.myCroppa.remove();
                _.set(this.$data, 'imgUrl', url || '');

              }).catch((err) => {
                _.set(this.$data, 'isImageUploading', false);
                alert('Failed to upload the image on the Google dirve');
                _.set(this.$data, 'accessToken', null);
                _.set(this.$data, 'imgUrl', '');
                this.$data.myCroppa.remove();
              })
            });
          }
        })
      ),
      watchSliderValue: this.$watchAsObservable('zoomSliderValue').pipe(
        pluck('newValue'),
        map(newZoomSliderValue => {
          _.set(this.$data.myCroppa, 'scaleRatio', +newZoomSliderValue);
        })
      ),
      exchangeAccessToken: this.$data.exchangeAccessToken$.pipe(
        map(event => {
          if (isClickEvent(event)) {
            const code = _.get(this.$data, 'authorizationCode');
            const clientId = _.get(this.$data, 'oAuthInfo.clientId');
            const clientSecret = _.get(this.$data, 'oAuthInfo.clientSecret');
            const grnatType = _.get(this.$data, 'oAuthInfo.grnatType');
            const redirectUri = _.get(this.$data, 'oAuthInfo.redirectUri');
            const baseURI = `${_.get(this.$data, 'tokenBaseUrl')}??access_type=offline&grant_type=${grnatType}&code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}`;

            if (_.isUndefined(code)) {
              return;
            }

            axios({
              method: 'post',
              url: baseURI,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then(response => {
              _.set(this.$data, 'authorizationCode', '');
              _.set(this.$data, 'accessToken', `${_.get(response, 'data.token_type')} ${_.get(response, 'data.access_token')}`);
            }).catch(err => {
              alert('Failed to get OAuth2 access token');
              console.error(`[exchangeAccessToken] err: ${err}`);
            });
          }
        })
      )
    }
  }
})
</script>

<style lang="scss" scoped>
.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.google-access-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  div {
    margin-top: 10px;
  }
}

.image-uploader-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-limitation-noti-container {
  padding: 5px 0 0 0;
  display: flex;
  align-items: center;
}

.my-croppa-container {
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group-container {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-control-group-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image-resize-control-container {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  align-items: center;

  input {
    flex-grow: 1;
  }
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;

  button {
    margin-left: 20px;
  }

  button:first-child {
    margin-left: 0px;
  }
}

.image-container {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 50%;
  }
}

.loader {
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
