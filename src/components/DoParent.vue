<template>
  <div>
    <h1>Parent Component</h1>
    <child1>
      <child2></child2>
    </child1>
  </div>
</template>

<script>
import Child1 from "./DoChild1"
import Child2 from "./DoChild2"

export default {
  components: {Child1, Child2},
  name: 'do-parent',
  data () {
    return {
      title: "Parent Component"
    }
  },
}
</script>
