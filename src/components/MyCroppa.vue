<template>
  <div class="main-container">
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
      <div v-show="!isImageUploaded"
           class="button-group">
        <button v-stream:click="chooseTarget$">
          Choose Image
        </button>
      </div>

      <div v-show="isImageUploaded"
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
      <img class="output" :src="imgUrl">
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

Vue.use(Croppa);

const IMAGE_MAX_WIDTH = 150;
const IMAGE_MAX_HEIGHT = 150;

function isClickEvent(mouseEvent: Object) {
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
      IMAGE_MAX_WIDTH,
      IMAGE_MAX_HEIGHT,
      myCroppa: null,
      imgUrl: '',
      zoomSliderValue: 0,
      zoomSliderMin: 0,
      zoomSliderMax: 0,
      isImageUploaded: false,
      chooseTarget$: new Subject(),
      zoomIn$: new Subject(),
      zoomOut$: new Subject(),
      cancelUpload$: new Subject(),
      uploadImage$: new Subject(),
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
      this.isImageUploaded = false;
      this.zoomSliderValue = 0;
      this.zoomSliderMin = 0;
      this.zoomSliderMax = 0;
    },
    onImageChosen() {
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

      this.isImageUploaded = true;
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
            this.$data.isImageUploaded = false;
          }
        })
      ),
      uploadImage: this.$data.uploadImage$.pipe(
        map(event => {
          if (isClickEvent(event)) {
            let url = this.$data.myCroppa.generateDataUrl();

            this.$data.myCroppa.remove();
            this.$data.isImageUploaded = false;

            if (!url) {
              return;
            }

            this.$data.imgUrl = url;
          }
        })
      ),
      watchSliderValue: this.$watchAsObservable('zoomSliderValue').pipe(
        pluck('newValue'),
        map(newZoomSliderValue => {
          _.set(this.$data.myCroppa, 'scaleRatio', +newZoomSliderValue);
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
</style>
