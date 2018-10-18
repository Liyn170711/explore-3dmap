<script>
import commonMixin from './mixins/common.js'
export default {
    mixins: [commonMixin],
    name: 'do-child2',
    data () {
        return {
        }
    },
    methods: {
        test () {
            var parent = this.$parent;
            var parent_el = this.$parent.$el;
            var child0 = this.$parent.$children[0];
            var child0_el = this.$parent.$children[0].el;
            console.log("parent",parent);
            console.log("parent_el",parent_el);
            console.log("child0",child0);
            console.log("child0_el",child0_el);
            var flag = (parent_el ===child0_el);
            console.log("parent_el===child0_el:",flag)
        }
    }
}
</script>
