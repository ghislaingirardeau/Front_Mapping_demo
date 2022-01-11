<template>
    <div>
        <h3 class="title" leaflet-browser-print-content>Legend</h3>
        <p class="sub-content" leaflet-browser-print-content >Ici la legende</p>
        <!-- ADD leaflet-browser-print-content and class="sub-content" or class="title" 
            Printing additional content section = print the legend or here the table data
            CUSTOMIZE with css style
        -->
    </div>
</template>

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
	.sub-content { // Dynamic sub content styling
		grid-row: 5;
		padding-left: 10px;
	}
}
</style>