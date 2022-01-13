<template>
		<v-col cols="12" class="legend__bloc">
			<!-- ADD leaflet-browser-print-content and class="sub-content" or class="title" 
				Printing additional content section = print the legend or here the table data
				CUSTOMIZE with css style
			-->
			<v-row class="title" leaflet-browser-print-content>
				<v-col cols="12">
				<p class="legend__title">Legend</p>
				</v-col>

				<v-col v-for="item in items" :key="item.content" cols="6">
					<svg :style="item.iconSize" viewBox="0 0 24 24">
						<path :fill="item.iconColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
					</svg>
					<p class="items--font">{{item.content}}</p>
				</v-col>
			</v-row>
		</v-col>
</template>

<script>
export default {
	data: () => ({
		items: [
			{
				content: 'Not interviewed',
				iconSize: 'width:24px;height:24px',
				iconColor: 'black'
			},
			{
				content: 'Interviewed',
				iconSize: 'width:24px;height:24px',
				iconColor: 'green'
			},
			{
				content: 'indebted',
				iconSize: 'width:24px;height:24px',
				iconColor: 'orange'
			},
			{
				content: 'land lost',
				iconSize: 'width:24px;height:24px',
				iconColor: 'red'
			}
		]
		
	}),
	methods: {
		houseIcon(colors, size) {
			return `<svg style="width:${size}px;height:${size}px" viewBox="0 0 24 24">
				<path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
            </svg>`
		}
	}
}
</script>

<style lang="scss">
leaflet-browser-print-content{
    .grid-print-container { // grid holder that holds all content (map and any other content)
		grid-template: auto 1fr auto / 1fr;
		background-color: orange;
	}
	.grid-map-print { // map container itself
		grid-row: 2;
	}
	.title { // Dynamic title styling
		grid-row: 1;
		justify-self: center;
		color: white;
	}
}
.legend__bloc{
	background-color: white;
	border: 2px solid grey;
	& > div{
		color: black;
		font-size: 12px;
	}
	& .legend__title{
		
	}
}
</style>