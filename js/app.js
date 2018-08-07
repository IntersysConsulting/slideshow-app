Vue.component('slideshow-media', {
    template:`
        <img v-if="mediaUrl !== null" v-bind:src="mediaUrl" class="media-component"/>
        <div v-else>
            <h1>No images available</h1>
        </div> 
    `,
    props: ['mediaIndex', 'mediaUrls'],
    computed: {
        mediaUrl: function() {
            if (!this.mediaUrls || this.mediaUrls.length === 0) {
                return null
            }

            return this.mediaUrls[this.mediaIndex]
        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
        message: 'This is a Vue App',
        currentMediaIndex: 0,
        imagesUrls: null,
        showErrorMsg: false,
        slideShowTimer: null
    },
    created: function () { 
        this.getMediaUrls()
        this.startSlideshow()
    },
    beforeDestroy: function() {
        this.stopSlideshow()
    },
    methods: {
        stopSlideshow: function () {
            clearInterval(this.slideShowTimer)
            this.slideShowTimer = null
        },
        startSlideshow: function() {
            this.slideShowTimer = setInterval(() => {
                let newIndex = this.currentMediaIndex + 1

                if ( newIndex >= this.imagesUrls.length ) {
                    newIndex = 0// Reset the slideshow
                }

                this.currentMediaIndex = newIndex
            }, 5000)
        },
        getMediaUrls: function() {
            fetch('https://api.github.com/repos/IntersysConsulting/slideshow-app/contents/media')
                .then( res => res.json() )
                .then( payload => {
                    const newImagesUrls = payload.filter( item => item.type === 'file' ).map( item => item.download_url )
                    if ( this.currentMediaIndex >= newImagesUrls.length ) {
                        this.currentMediaIndex = 0// Reset the slideshow
                    }
                    this.imagesUrls = newImagesUrls
                    this.showErrorMsg = false
                } )
                .catch( () => this.showErrorMsg = true )
            }
    }
})
