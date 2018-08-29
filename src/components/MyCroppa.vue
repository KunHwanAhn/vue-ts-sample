<template>
  <div class="main-container">
    <div class="image-limitation-noti-container"
         :style="{width: `${CROPPA_WIDTH}px`}">
      <span>
        ({{ IMAGE_MAX_WIDTH }}px * {{ IMAGE_MAX_HEIGHT }}px / {{ FILE_SIZE_LIMIT / 1024 / 1024 }}MB미만)
      </span>
    </div>
    <div class="my-croppa-container">
      <croppa v-model="myCroppa"
              :width="CROPPA_WIDTH"
              :height="CROPPA_HEIGHT"
              :accept="FILE_TYPES"
              :show-loading="SHOW_LOADING"
              :file-size-limit="FILE_SIZE_LIMIT"
              :disable-click-to-choose="DISABLE_CLICK_TO_CHOOSE"
              :remove-button-size="REMOVE_BUTTON_SIZE"
              :initial-size="INITIAL_IMAGE_SIZE"
              placeholder=""
              @file-size-exceed="onFileSizeExceeded"
              @new-image-drawn="onImageChosen">
      </croppa>
    </div>

    <div class="button-group-container">
      <div v-show="!isImageUploaded"
           class="button-group">
        <button id="addButton">
          이미지 추가
        </button>
      </div>

      <div v-show="isImageUploaded"
           class="button-group">
        <button id="cancelButton">
          취소
        </button>
        <button id="confirmButton">
          확인
        </button>
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
import { map } from 'rxjs/operators';

Vue.use(Croppa);

const CROPPA_WIDTH = 400;
const CROPPA_HEIGHT = 300;
const FILE_TYPES = '.png,.jpeg';
const SHOW_LOADING = true;
const FILE_SIZE_LIMIT = 1024 * 1024;
const DISABLE_CLICK_TO_CHOOSE = true;
const REMOVE_BUTTON_SIZE = 20;
const INITIAL_IMAGE_SIZE = 'natural';
const IMAGE_MAX_WIDTH = 150;
const IMAGE_MAX_HEIGHT = 150;

function isClickEvent(mouseEvent: Object) {
  return _.get(mouseEvent, 'type') === 'click'
}

export default Vue.extend({
  // name: 'myCroppa',
  data() {
    return {
      CROPPA_WIDTH,
      CROPPA_HEIGHT,
      FILE_TYPES,
      SHOW_LOADING,
      FILE_SIZE_LIMIT,
      DISABLE_CLICK_TO_CHOOSE,
      REMOVE_BUTTON_SIZE,
      INITIAL_IMAGE_SIZE,
      IMAGE_MAX_WIDTH,
      IMAGE_MAX_HEIGHT,
      isImageUploaded: false,
      myCroppa: null,
      imgUrl: '',
    }
  },
  methods: {
    onFileSizeExceeded(file: any): void {
      alert(`Size of ${file.name} is over than ${this.FILE_SIZE_LIMIT / 1024}Kbyte`);
    },
    onImageChosen() {
      let imageInfo = _.get(this.myCroppa, 'imgData');

      if (_.get(imageInfo, 'width') > IMAGE_MAX_WIDTH) {
        alert(`Width is over than ${this.IMAGE_MAX_WIDTH}px`);
        this.$data.myCroppa.remove();

        return;
      }

      if (_.get(imageInfo, 'height') > IMAGE_MAX_HEIGHT) {
        alert(`Height is over than ${this.IMAGE_MAX_HEIGHT}px`);
        this.$data.myCroppa.remove();

        return;
      }

      this.isImageUploaded = true;
    }
  },
  subscriptions() {
    return {
      chooseTarget: this.$fromDOMEvent('#addButton', 'click').pipe(
        map(event => {
          if (isClickEvent(event)) {
            this.$data.myCroppa.chooseFile();
          }
        })
      ),
      cancelUpload: this.$fromDOMEvent('#cancelButton', 'click').pipe(
        map(event => {
          if (isClickEvent(event)) {
            this.$data.myCroppa.remove();
            this.$data.isImageUploaded = false;
          }
        })
      ),
      uploadImage: this.$fromDOMEvent('#confirmButton', 'click').pipe(
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

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;

  button:nth-child(even) {
    margin-left: 20px;
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
