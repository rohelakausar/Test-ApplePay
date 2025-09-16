var options = {}

var count = 1;

function noClickDelay(el) {
    this.element = el;
    if (window.Touch) this.element.addEventListener('touchstart', this, false);
}

noClickDelay.prototype = {
    handleEvent: function (e) {
        switch (e.type) {
            case 'touchstart': this.onTouchStart(e); break;
            case 'touchmove': this.onTouchMove(e); break;
            case 'touchend': this.onTouchEnd(e); break;
        }
    },

    onTouchStart: function (e) {
        e.preventDefault();
        this.moved = false;

        this.element.addEventListener('touchmove', this, false);
        this.element.addEventListener('touchend', this, false);
    },

    onTouchMove: function (e) {
        this.moved = true;
    },

    onTouchEnd: function (e) {
        this.element.removeEventListener('touchmove', this, false);
        this.element.removeEventListener('touchend', this, false);

        if (!this.moved) {
            var theEvent = document.createEvent('MouseEvents');
            theEvent.initEvent('click', true, true);
            this.element.dispatchEvent(theEvent);
        }
    }
};

var watches = document.getElementsByClassName("watch-item");
for (var idx = 0; idx < watches.length; idx++) {
    noClickDelay(watches[idx]);
}

window.addEventListener('load', function (event) {
    hideLoading();
});

function hideLoading() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.classList.add("hidden");
    }
}