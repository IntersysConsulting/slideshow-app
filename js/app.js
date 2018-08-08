var GITHUB_TOKEN = 'Insert your Github Token here'
var SLIDESHOW_TIME_DELAY = 5000
var TIME_TO_UPDATE = 10800000// 3 hours

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

Vue.component('delay-config', {
    template:`
        <h1 v-if="show" class="ui-text">{{ text }}</h1>
    `,
    data: function() {
        return {
            show: false,
            overlayTimer: null,
            timeDelay: SLIDESHOW_TIME_DELAY
        }
    },
    created: function() {
        document.addEventListener('keydown', this.onKeydownHandler)
    },
    methods: {
        onKeydownHandler: function(e) {
            switch(e.keyCode){
                case 38: //UP arrow
                    if (this.show) {
                        this.showOverlay()
                        this.setTimeDelay(SLIDESHOW_TIME_DELAY + 1000)
                    }
                    else {
                        this.showOverlay()                    
                    }
                    break
                case 40: //DOWN arrow
                    if (this.show) {
                        this.showOverlay()
                        this.setTimeDelay(SLIDESHOW_TIME_DELAY - 1000)
                    }
                    else {
                        this.showOverlay()                    
                    }
                    break
                case 13: //OK button
                    break
                case 10009: //RETURN button
                    tizen.application.getCurrentApplication().exit()
                    break
            }
        },
        showOverlay: function() {
            
            if (this.overlayTimer) {
                clearTimeout(this.overlayTimer)
            }
            
            this.show = true
            this.overlayTimer = setTimeout(() => {
                this.show = false
                this.overlayTimer = null
            }, 4000)
        },
        setTimeDelay: function(newVal) {
            if (newVal < 1000) {
                newVal = 1000
            }

            SLIDESHOW_TIME_DELAY = newVal
            this.timeDelay = SLIDESHOW_TIME_DELAY
            this.$emit('time-delay-changed', SLIDESHOW_TIME_DELAY)
        }
    },
    computed: {
        text: function() {
            return (this.timeDelay / 1000) + ' seconds of delay'
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
    created: function() {
        document.addEventListener('visibilitychange', () => {
            if(document.hidden){
                this.onAppHideOrExitHandler()
            } else {
                this.onAppResumeHandler()
            }
        })

        this.getMediaUrls()
        this.startSlideshow(SLIDESHOW_TIME_DELAY)

        setInterval(this.getMediaUrls, TIME_TO_UPDATE)// Keep updating the media content
    },
    beforeDestroy: function() {
        this.stopSlideshow()
    },
    methods: {
        onTimeDelayChangeHandler: function(newTimeDelay) {
            this.stopSlideshow()
            this.startSlideshow(newTimeDelay)
        },
        onAppHideOrExitHandler: function() {
            this.stopSlideshow()
        },
        onAppResumeHandler: function() {
            this.getMediaUrls()
            this.startSlideshow(SLIDESHOW_TIME_DELAY)
        },
        stopSlideshow: function() {
            clearInterval(this.slideShowTimer)
            this.slideShowTimer = null
        },
        startSlideshow: function(timeDelay) {
            this.slideShowTimer = setInterval(() => {
                var newIndex = this.currentMediaIndex + 1

                if ( newIndex >= this.imagesUrls.length ) {
                    newIndex = 0// Reset the slideshow
                }

                this.currentMediaIndex = newIndex
            }, timeDelay)
        },
        getMediaUrls: function() {
            var headers = new Headers({
                Authorization: 'token' + GITHUB_TOKEN
            })
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
