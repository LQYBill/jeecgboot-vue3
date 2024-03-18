<template>
  <svg :fill="color" :width="width" :height="height" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <title>{{ title }}</title>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <g> <g> <path d="M387.755,40.023H124.246L0,189.119v282.858h512V189.119L387.755,40.023z M380.398,55.731l106.676,128.014H341.976 l-35.6-128.014H380.398z M290.072,55.731l35.6,128.014H186.327l35.587-128.014H290.072z M328.255,199.452v86.019L256,263.81 l-72.255,21.661v-86.019H328.255z M131.603,55.731h74.007l-35.586,128.014H24.926L131.603,55.731z M496.292,216.207h-16.196 v15.708h16.196v224.354H15.708V231.915h16.196v-15.708H15.708v-16.755h152.329v16.755H40.281v15.708h127.756v74.663L256,280.209 l87.963,26.369v-74.663h127.756v-15.708H343.963v-16.755h152.329V216.207z"></path> </g> </g>
      <g> <g> <rect x="247.627" y="64.37" width="15.708" height="112.048"></rect> </g> </g>
      <g> <g> <path d="M272.161,360.212v79.746h199.816v-79.746H272.161z M456.269,424.25h-168.4V375.92h168.4V424.25z"></path> </g> </g>
      <g> <g> <polygon points="216.128,320.189 216.128,407.94 264.006,407.94 264.006,392.232 231.835,392.232 231.835,335.897 344.203,335.897 344.203,352.057 359.911,352.057 359.911,320.189 "></polygon> </g> </g>
      <g> <g> <rect x="304.174" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="328.26" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="352.345" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="376.43" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="400.515" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="424.6" y="392.138" width="15.708" height="15.708"></rect> </g> </g>
      <g> <g> <rect x="247.627" y="360.722" width="16.755" height="15.708"></rect> </g> </g>
      <g> <g> <polygon points="63.886,374.637 35.516,393.551 44.229,406.62 55.989,398.78 55.989,431.926 71.696,431.926 71.696,398.721 83.545,406.62 92.258,393.551 "></polygon> </g> </g>
      <g> <g> <polygon points="127.925,374.637 99.554,393.551 108.267,406.62 119.867,398.887 119.867,431.926 135.574,431.926 135.574,398.616 147.582,406.62 156.295,393.551 "></polygon> </g> </g>
      <g> <g> <rect x="247.627" y="207.834" width="15.708" height="15.708"></rect> </g> </g>
    </g>
  </svg>
</template>
<script>
export default {
  name: "PackagesIcon",
  props: {
    width: {
      type: String,
      default: '24px'
    },
    height: {
      type: String,
      default: '24px'
    },
    color: {
      type: String,
      default: '#000000'
    },
    title: {
      type: String,
      default: 'Packages Icon'
    }
  },
  setup(props) {
    return {
      width: props.width,
      height: props.height,
      color: props.color,
      title: props.title,
    }
  }
}
</script>
