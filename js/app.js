var GITHUB_TOKEN = 'Insert your Github Token here';


Vue.component('slideshow-media', {
    template:`
        <img v-if="mediaUrl !== null" v-bind:src="mediaUrl" class="media-component"/>
        <div v-else>
            <h1 class="white-text">No images available</h1>
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
        hasErrorMsg: null,
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
                var newIndex = this.currentMediaIndex + 1

                if ( newIndex >= this.imagesUrls.length ) {
                    newIndex = 0// Reset the slideshow
                }

                this.currentMediaIndex = newIndex
            }, 5000)
        },
        getMediaUrls: function() {
            var headers = new Headers({
                Authorization: 'token' + GITHUB_TOKEN
            });
            fetch(
                'https://api.github.com/repos/IntersysConsulting/slideshow-app/contents/media',
                { 
                    headers
                }
            )
            .then( res => {
                if (res.ok) {
                    return res.json()
                }
                else {
                    throw new Error(res.body)
                }
            } )
            .then( payload => {
                var newImagesUrls = payload.filter( item => item.type === 'file' ).map( item => item.download_url )
                if ( this.currentMediaIndex >= newImagesUrls.length ) {
                    this.currentMediaIndex = 0// Reset the slideshow
                }
                this.imagesUrls = newImagesUrls
                this.hasErrorMsg = null
            } )
            .catch( err => {
                this.hasErrorMsg = err
            } )
        }
    }
})
