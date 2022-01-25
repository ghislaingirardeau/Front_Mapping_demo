<template>
		<v-col cols="12" class="option__bloc">

			<v-row class="option__bloc legend__bloc" v-if="showContent">
				<v-col v-for="item in items" :key="item.content" cols="4" sm="3" lg="2" class="block__items">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path :fill="item.iconColor" :d="item.path" />
					</svg>
					<span class="items--font">{{item.content}}</span>
				</v-col>
			</v-row>

			<v-row class="text-center">

				<exportCSV />

				<v-col cols="6">
					<v-btn
						color="primary"
						dark
						@click="legend"
					>
					{{showContent ? 'Hide' : 'Legend'}}
					</v-btn>
				</v-col>
			</v-row>


		</v-col>
</template>

<script>
import exportCSV from '@/components/leaflet/exportCSV.vue' 

export default {
	data: () => ({
		showContent: false,
		items: [
			{
				content: 'Not interviewed',
				path: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
				iconColor: 'black'
			},
			{
				content: 'Interviewed',
				path: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
				iconColor: 'green'
			},
			{
				content: 'indebted',
				path: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
				iconColor: 'orange'
			},
			{
				content: 'land lost',
				path: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
				iconColor: 'red'
			},
			{
				content: 'bath',
				path: "M7 5C8.11 5 9 5.9 9 7S8.11 9 7 9 5 8.11 5 7 5.9 5 7 5M20 13V4.83C20 3.27 18.73 2 17.17 2C16.42 2 15.7 2.3 15.17 2.83L13.92 4.08C13.76 4.03 13.59 4 13.41 4C13 4 12.64 4.12 12.33 4.32L15.09 7.08C15.29 6.77 15.41 6.4 15.41 6C15.41 5.82 15.38 5.66 15.34 5.5L16.59 4.24C16.74 4.09 16.95 4 17.17 4C17.63 4 18 4.37 18 4.83V13H11.15C10.85 12.79 10.58 12.55 10.33 12.28L8.93 10.73C8.74 10.5 8.5 10.35 8.24 10.23C7.93 10.08 7.59 10 7.24 10C6 10 5 11 5 12.25V13H2V19C2 20.1 2.9 21 4 21C4 21.55 4.45 22 5 22H19C19.55 22 20 21.55 20 21C21.1 21 22 20.1 22 19V13H20M20 19H4V15H20V19Z",
				iconColor: 'black'
			},
			{
				content: 'grave',
				path: "M10,2H14C17.31,2 19,4.69 19,8V18.66C16.88,17.63 15.07,17 12,17C8.93,17 7.12,17.63 5,18.66V8C5,4.69 6.69,2 10,2M8,8V9.5H16V8H8M9,12V13.5H15V12H9M3,22V21.31C5.66,19.62 13.23,15.84 21,21.25V22H3Z",
				iconColor: 'black'
			},
			{
				content: 'chief House',
				path: "M10,2V4.26L12,5.59V4H22V19H17V21H24V2H10M7.5,5L0,10V21H15V10L7.5,5M14,6V6.93L15.61,8H16V6H14M18,6V8H20V6H18M7.5,7.5L13,11V19H10V13H5V19H2V11L7.5,7.5M18,10V12H20V10H18M18,14V16H20V14H18Z",
				iconColor: 'black'
			},
			{
				content: 'homestay',
				path: "M12,3L2,12H5V20H19V12H22L12,3M12,7.7C14.1,7.7 15.8,9.4 15.8,11.5C15.8,14.5 12,18 12,18C12,18 8.2,14.5 8.2,11.5C8.2,9.4 9.9,7.7 12,7.7M12,10A1.5,1.5 0 0,0 10.5,11.5A1.5,1.5 0 0,0 12,13A1.5,1.5 0 0,0 13.5,11.5A1.5,1.5 0 0,0 12,10Z",
				iconColor: 'black'
			},
			{
				content: 'communal',
				path: "M12 5C6.5 5 2 9.5 2 15V21H22V15C22 9.5 17.5 5 12 5M12 7C14.53 7 16.78 8.17 18.25 10H5.76C7.22 8.17 9.47 7 12 7M8 19H4V15C4 13.94 4.21 12.93 4.58 12H8V19M14 19H10V12H14V19M20 19H16V12H19.42C19.79 12.93 20 13.94 20 15V19Z",
				iconColor: 'black'
			},
			{
				content: 'well public',
				path: "M3.62 8H5V15H7V8H11V10H13V8H17V15H19V8H20.61C21.16 8 21.61 7.56 21.61 7C21.61 6.89 21.6 6.78 21.56 6.68L19 2H5L2.72 6.55C2.47 7.04 2.67 7.64 3.16 7.89C3.31 7.96 3.46 8 3.62 8M6.24 4H17.76L18.76 6H5.24L6.24 4M2 16V18H4V22H20V18H22V16H2M18 20H6V18H18V20M13.93 11C14.21 11 14.43 11.22 14.43 11.5C14.43 11.5 14.43 11.54 14.43 11.56L14.05 14.56C14 14.81 13.81 15 13.56 15H10.44C10.19 15 10 14.81 9.95 14.56L9.57 11.56C9.54 11.29 9.73 11.04 10 11C10.03 11 10.05 11 10.07 11H13.93Z",
				iconColor: 'red'
			},
			{
				content: 'well private',
				path: "M3.62 8H5V15H7V8H11V10H13V8H17V15H19V8H20.61C21.16 8 21.61 7.56 21.61 7C21.61 6.89 21.6 6.78 21.56 6.68L19 2H5L2.72 6.55C2.47 7.04 2.67 7.64 3.16 7.89C3.31 7.96 3.46 8 3.62 8M6.24 4H17.76L18.76 6H5.24L6.24 4M2 16V18H4V22H20V18H22V16H2M18 20H6V18H18V20M13.93 11C14.21 11 14.43 11.22 14.43 11.5C14.43 11.5 14.43 11.54 14.43 11.56L14.05 14.56C14 14.81 13.81 15 13.56 15H10.44C10.19 15 10 14.81 9.95 14.56L9.57 11.56C9.54 11.29 9.73 11.04 10 11C10.03 11 10.05 11 10.07 11H13.93Z",
				iconColor: 'blue'
			},
			{
				content: 'worship',
				path: "M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z",
				iconColor: 'black'
			}
		]
		
	}),
	components: {
		exportCSV
	},
	methods: {
		houseIcon(colors, size) {
			return `<svg style="width:${size}px;height:${size}px" viewBox="0 0 24 24">
				<path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
            </svg>`
		},
		legend() {
			this.showContent = !this.showContent
		}
	}
}
</script>

<style lang="scss">
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
.items--font{
	font-size: 12px;
}
.block__items{
	padding: 2px;
}
/* @media print { 
	.option__bloc{
		display: none;
	}
}
 */</style>