const getParent = $component =>
  $component.abstract || $component.$el === $component.$children[0].$el 
    ? getParent($component.$parent)
    : $component
export default {
  methods: {
    ready () {
      this.test()
    },
    transmitEvent (e) {
      this.$emit(e.type.replace(/^on/, ''), e)
    },
    reload () {
      this.load()
    }
  },
  mounted () {
    this.$parent = getParent(this.$parent)
    const { ready } = this
    ready()
  }
}
