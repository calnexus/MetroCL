var Video = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.fullscreen = false;
        this.player = null;
        this.video = elem;
        this.stream = null;
        this.volume = null;
        this.volumeBackup = 0;
        this.muted = false;
        this.fullScreenInterval = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        src: null,

        poster: "",
        logo: "",
        logoHeight: 32,
        logoWidth: "auto",
        logoTarget: "",

        volume: .5,
        loop: false,
        autoplay: false,

        fullScreenMode: METRO_FULLSCREEN_MODE.DESKTOP,
        aspectRatio: METRO_ASPECT_RATIO.HD,

        controlsHide: 0,

        showLoop: true,
        showPlay: true,
        showStop: true,
        showMute: true,
        showFull: true,
        showStream: true,
        showVolume: true,
        showInfo: true,

        loopIcon: "<span class='default-loop'></span>",
        stopIcon: "<span class='default-stop'></span>",
        playIcon: "<span class='default-play'></span>",
        pauseIcon: "<span class='default-pause'></span>",
        muteIcon: "<span class='default-mute'></span>",
        volumeLowIcon: "<span class='default-low-volume'></span>",
        volumeMediumIcon: "<span class='default-medium-volume'></span>",
        volumeHighIcon: "<span class='default-high-volume'></span>",
        screenMoreIcon: "<span class='default-enlarge'></span>",
        screenLessIcon: "<span class='default-shrink'></span>",

        onPlay: Metro.noop,
        onPause: Metro.noop,
        onStop: Metro.noop,
        onEnd: Metro.noop,
        onMetadata: Metro.noop,
        onTime: Metro.noop,
        onVideoCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var that = this, element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = $.parseJSON(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options, video = this.video;

        this._createPlayer();
        this._createControls();
        this._createEvents();
        this._setAspectRatio();

        if (o.autoplay === true) {
            this.play();
        }

        Utils.exec(o.onVideoCreate, [element]);
    },

    _createPlayer: function(){
        var that = this, element = this.element, o = this.options, video = this.video;

        var prev = element.prev();
        var parent = element.parent();
        var player = $("<div>").addClass("video " + element[0].className);
        var preloader = $("<div>").addClass("preloader").appendTo(player);
        var logo = $("<a>").attr("href", o.logoTarget).addClass("logo").appendTo(player);

        if (prev.length === 0) {
            parent.prepend(player);
        } else {
            player.insertAfter(prev);
        }

        element.appendTo(player);

        $.each(['muted', 'autoplay', 'controls', 'height', 'width', 'loop', 'poster', 'preload'], function(){
            element.removeAttr(this);
        });

        element.attr("preload", "auto");

        if (o.poster !== "") {
            element.attr("poster", o.poster);
        }

        video.volume = o.volume;

        preloader.activity({
            type: "cycle",
            style: "color"
        });

        this.preloader = preloader;

        if (o.logo !== "") {
            $("<img>")
                .css({
                    height: o.logoHeight,
                    width: o.logoWidth
                })
                .attr("src", o.logo).appendTo(logo);
        }

        if (o.src !== null) {
            this._setSource(o.src);
        }

        this.player = player;
    },

    _setSource: function(src){
        var element = this.element;

        element.find("source").remove();
        element.removeAttr("src");
        if (Array.isArray(src)) {
            $.each(src, function(){
                var item = this;
                if (item.src === undefined) return ;
                $("<source>").attr('src', item.src).attr('type', item.type !== undefined ? item.type : '').appendTo(element);
            });
        } else {
            element.attr("src", src);
        }
    },

    _createControls: function(){
        var that = this, element = this.element, o = this.options, video = this.elem, player = this.player;

        var controls = $("<div>").addClass("controls").addClass(o.clsControls).insertAfter(element);
        var buttons = $("<div>").addClass("buttons").appendTo(controls);

        var stream = $("<div>").addClass("stream").appendTo(buttons);
        var streamSlider = $("<input>").addClass("stream-slider ultra-thin cycle-marker").appendTo(stream);

        var volume = $("<div>").addClass("volume").appendTo(buttons);
        var volumeSlider = $("<input>").addClass("volume-slider ultra-thin cycle-marker").appendTo(volume);

        var infoBox = $("<div>").addClass("info-box").appendTo(buttons);

        if (o.showInfo !== true) {
            infoBox.hide();
        }

        streamSlider.slider({
            clsMarker: "bg-red",
            clsHint: "bg-cyan fg-white",
            clsComplete: "bg-cyan",
            hint: true,
            onStart: function(){
                if (!video.paused) video.pause();
            },
            onStop: function(val){
                if (video.seekable.length > 0) {
                    video.currentTime = (that.duration * val / 100).toFixed(0);
                }
                if (video.paused && video.currentTime > 0) {
                    video.play();
                }
            }
        });

        this.stream = streamSlider;

        if (o.showStream !== true) {
            stream.hide();
        }

        volumeSlider.slider({
            clsMarker: "bg-red",
            clsHint: "bg-cyan fg-white",
            hint: true,
            value: o.volume * 100,
            onChangeValue: function(val){
                video.volume = val / 100;
            }
        });

        this.volume = volumeSlider;

        if (o.showVolume !== true) {
            volume.hide();
        }

        var loop, play, stop, mute, full;

        if (o.showLoop === true) loop = $("<button>").attr("type", "button").addClass("button loop").html(o.loopIcon).appendTo(buttons);
        if (o.showPlay === true) play = $("<button>").attr("type", "button").addClass("button play").html(o.playIcon).appendTo(buttons);
        if (o.showStop === true) stop = $("<button>").attr("type", "button").addClass("button stop").html(o.stopIcon).appendTo(buttons);
        if (o.showMute === true) mute = $("<button>").attr("type", "button").addClass("button mute").html(o.muteIcon).appendTo(buttons);
        if (o.showFull === true) full = $("<button>").attr("type", "button").addClass("button full").html(o.screenMoreIcon).appendTo(buttons);

        if (o.loop === true) {
            loop.addClass("active");
            element.attr("loop", "loop");
        }

        this._setVolume();

        if (o.muted) {
            that.volumeBackup = video.volume;
            that.volume.data('slider').val(0);
            video.volume = 0;
        }

        infoBox.html("00:00 / 00:00");
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options, video = this.elem, player = this.player;
        var infobox = player.find(".info-box");

        element.on("loadstart", function(){
            that.preloader.fadeIn();
        });

        element.on("loadedmetadata", function(){
            that.duration = video.duration.toFixed(0);
            infobox.html("00:00 / " + Utils.secondsToFormattedString(that.duration));
            Utils.exec(o.onMetadata, [video, player]);
        });

        element.on("canplay", function(){
            that._setBuffer();
            that.preloader.fadeOut();
        });

        element.on("progress", function(){
            that._setBuffer();
        });

        element.on("timeupdate", function(){
            var currentTime = Math.round(video.currentTime);
            var position = Math.round(video.currentTime * 100 / that.duration);
            infobox.html(Utils.secondsToFormattedString(currentTime) + " / " + Utils.secondsToFormattedString(that.duration));
            that.stream.data('slider').val(position);
            Utils.exec(o.onTime, [currentTime, that.duration, video, player]);
        });

        element.on("waiting", function(){
            that.preloader.fadeIn();
        });

        element.on("loadeddata", function(){

        });

        element.on("play", function(){
            player.find(".play").html(o.pauseIcon);
            Utils.exec(o.onPlay, [video, player]);
        });

        element.on("pause", function(){
            player.find(".play").html(o.playIcon);
            Utils.exec(o.onPause, [video, player]);
        });

        element.on("stop", function(){
            that.stream.data('slider').val(0);
            Utils.exec(o.onStop, [video, player]);
        });

        element.on("ended", function(){
            that.stream.data('slider').val(0);
            Utils.exec(o.onEnd, [video, player]);
        });

        element.on("volumechange", function(){
            that._setVolume();
        });

        player.on("click", ".play", function(e){
            if (video.paused) {
                that.play();
            } else {
                that.pause();
            }
        });

        player.on("click", ".stop", function(e){
            that.stop();
            e.preventDefault();
            e.stopPropagation();
        });

        player.on("click", ".mute", function(e){
            that.muted = !that.muted;
            if (that.muted === false) {
                video.volume = that.volumeBackup;
                that.volume.data('slider').val(that.volumeBackup * 100);
            } else {
                that.volumeBackup = video.volume;
                that.volume.data('slider').val(0);
                video.volume = 0;
            }
        });

        player.on("click", ".loop", function(){
            var loop = $(this);
            loop.toggleClass("active");
            if (loop.hasClass("active")) {
                element.attr("loop", "loop");
            } else {
                element.removeAttr("loop");
            }
        });

        player.on("click", ".full", function(e){
            that.fullscreen = !that.fullscreen;
            player.find(".full").html(that.fullscreen === true ? o.screenLessIcon : o.screenMoreIcon);
            if (o.fullScreenMode === METRO_FULLSCREEN_MODE.WINDOW) {
                if (that.fullscreen === true) {
                    player.addClass("full-screen");
                } else {
                    player.removeClass("full-screen");
                }
            } else {
                if (that.fullscreen === true) {
                    if (video.requestFullscreen) {
                        video.requestFullscreen();
                    } else if (video.mozRequestFullScreen) {
                        video.mozRequestFullScreen();
                    } else if (video.webkitRequestFullScreen) {
                        video.webkitRequestFullScreen();
                    } else if (video.msRequestFullscreen) {
                        video.msRequestFullscreen();
                    }
                    if (that.fullScreenInterval === false) that.fullScreenInterval = setInterval(function(){
                        var fsm = (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

                        if (fsm === undefined) {
                            that.fullscreen = false;
                            clearInterval(that.fullScreenInterval);
                            that.fullScreenInterval = false;
                            player.find(".full").html(o.screenMoreIcon);
                        }

                    }, 1000);
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                    else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                    else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                    else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            }

            if (that.fullscreen === true) {
                $(document).on("keyup.METRO_VIDEO", function(e){
                    if (e.keyCode === 27) {
                        console.log("ku");
                        player.find(".full").click();
                    }
                });
            } else {
                $(document).off("keyup.METRO_VIDEO");
            }
        });

        if (o.controlsHide > 0) {
            player.on(Metro.eventEnter, function(){
                player.find(".controls").fadeIn();
            });

            player.on(Metro.eventLeave, function(){
                setTimeout(function(){
                    player.find(".controls").fadeOut();
                }, o.controlsHide);
            });
        }

        $(window).resize(function(){
            that._setAspectRatio();
        });

    },

    _setBuffer: function(){
        var buffer = this.video.buffered.length ? Math.round(Math.floor(this.video.buffered.end(0)) / Math.floor(this.video.duration) * 100) : 0;
        this.stream.data('slider').buff(buffer);
    },

    _setVolume: function(){
        var video = this.video, player = this.player, o = this.options;

        var volumeButton = player.find(".mute");
        var volume = video.volume * 100;
        if (volume > 1 && volume < 30) {
            volumeButton.html(o.volumeLowIcon);
        } else if (volume >= 30 && volume < 60) {
            volumeButton.html(o.volumeMediumIcon);
        } else if (volume >= 60 && volume <= 100) {
            volumeButton.html(o.volumeHighIcon);
        } else {
            volumeButton.html(o.muteIcon);
        }
    },

    _setAspectRatio: function(){
        var player = this.player, o = this.options;
        var width = player.outerWidth();
        var height;

        switch (o.aspectRatio) {
            case METRO_ASPECT_RATIO.SD: height = width * 3 / 4; break;
            case METRO_ASPECT_RATIO.CINEMA: height = width * 9 / 21; break;
            default: height = 9 * width / 16;
        }

        player.outerHeight(height);
    },

    aspectRatio: function(ratio){
        this.options.aspectRatio = ratio;
        this._setAspectRatio();
    },

    play: function(src){
        if (src !== undefined) {
            this._setSource(src);
        }
        this.video.play();
    },

    pause: function(){
        this.video.pause();
    },

    resume: function(){
        if (this.video.paused) {
            this.play();
        }
    },

    stop: function(){
        this.video.pause();
        this.video.currentTime = 0;
        this.stream.data('slider').val(0);
    },

    changeAspectRatio: function(){
        var ratio = this.element.attr("data-aspect-ratio");
        this._setAspectRatio();
    },

    changeSource: function(){
        var src = JSON.parse(this.element.attr('data-src'));
        this.play(src);
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-aspect-ratio": this.changeAspectRatio(); break;
            case "data-src": this.changeSource(); break;
        }
    }
};

Metro.plugin('video', Video);