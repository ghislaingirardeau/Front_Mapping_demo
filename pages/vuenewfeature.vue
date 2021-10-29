<template>
  <div>
    <v-text-field 
      @input="property = $event.target.value"    
    />
    {{property}}
<!--     <button @click="increment">
      Count is: {{ count }}, double is {{ double }}, click to increment.
    </button>
 -->
  </div>
  
</template>

<script>
export default {
  data() {
    return {
      property: ''
    }
  }
}

/* import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    onMounted(() => console.log('component mounte'))

    return {
      count,
      double,
      increment
    }
  }
} */
</script>