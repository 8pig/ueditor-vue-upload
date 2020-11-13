<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="flex1">
      <p>t1</p>
      <p>t1</p>
      <p>t1</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.flex1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  color: red;
}
</style>
