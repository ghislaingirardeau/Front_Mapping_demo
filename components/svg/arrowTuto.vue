<template>
  <div class="arrow-marker">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
      <defs>
        <marker
          id="pointer"
          markerWidth="20"
          markerHeight="12"
          refX="9.5"
          refY="5.1"
          orient="-45"
          markerUnits="userSpaceOnUse"
        >
          <polyline points="1 1, 9 5, 1 7" fill='none' stroke='white' vector-effect= 'non-scaling-stroke' stroke-width='2'/>
        </marker>
      </defs>
      <path
        d="M 112 103 C 103 62 132 85 122 53 C 115 34 137 51 173 22"
        marker-end="url(#pointer)"
        fill='none'
        stroke='white'
        vector-effect= 'non-scaling-stroke'
        stroke-width='2'
        stroke-dasharray= '11, 5'
      />
    </svg>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.arrow-marker {
  z-index: 3;
  position: absolute;
  top: 0px;
  left: 10px;
  width: 180px;
  height: 180px;
  transform: rotateY(180deg) rotateZ(30deg);
}

</style>