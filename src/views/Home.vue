<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="//webpack4.0 开启热更新" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import { login } from '@apis/index.js';
export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  data () {
    return {
      data: 'abc',
      timer: null,
      num: 1
    };
  },
  mounted () {
    login({ username: 'admin', password: 'shengshangzx123' }).then(res => {
      console.log(res);
    });
  }
};
</script>
<style lang="scss">
.home {
  background: url("#{$theme-src}1525189943-38523.png") no-repeat;  color: #ccc;
}

</style>
