<template>
  <div class="mine">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: "mine",
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  },
  created() {
    this.$axios.get("/api/user").then(res => {
      console.log(res.data.sex);
      this.msg = res.data.sex;
    });
  },
  mounted() {},
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
