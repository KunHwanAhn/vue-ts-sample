# vue-ts-sample

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Project 설명

### 개발환경
- OS: Windows 10
- Node.js: v8.11.1
- NPM: 5.6.0
- vue-cli: 3.0.1

### 베이스 프로젝트
``` bash
shell:$ vue init webpack-simple {{ project_name }}
```

### 폴더 구조
- config: Google Drive를 사용하기 위한 인증 정보가 들어 있는 Config 폴
- src: 프로그램의 시작지점 소스코드가 들어있는 폴더
- src/components: Single File Component가 들어있는 폴더

### 파일 설명
- src/main.ts: Source code 진입점이자, 동작에 필요한 Library Import
- src/App.vue: 전체 컨테이너 및 Vue-Router로 페이지를 라우팅하는 페이지
- src/compoments/MyCroppa.vue: 이미지 업로드 기능 구현 Component
- src/compoments/HelloWorld.vue: Vue 및 RxJS 기능 테스트 Component
- src/compoments/TypeComponent.vue: Vue와 Typescript를 사용한 Component

### 구현 내용

#### 라우팅
- vue-router를 이용하여, 상단에 nav-bar를 만들고, Croppa, HelloWorld 페이지로 이동
- Croppa 페이지를 Default 페이지로 설정

#### MyCroppa
- Single File Component
- [vue-croppa](https://github.com/zhanziyang/vue-croppa) 라이브러리를 활용하여 기능 구현
- Handled Attributes & Events
  - accept: png, jpeg 확장자 제한
  - file-size-limit: 파일 사이즈 1MB 미만으로 제한
  - file-size-exceed: 파일 사이즈가 1MB를 넘었을 때, 사용자에게 Alert 노출
  - new-image-drawn: 파일의 너비와 높이 제한 확인 후, 사용자에게 Alert 노출
