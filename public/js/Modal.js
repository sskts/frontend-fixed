var Modal = (function () {
    function Modal() {
        this.init();
        this.setEvent();
    }
    Modal.prototype.init = function () {
        this.cover = $('.modal-cover');
    };
    Modal.prototype.setEvent = function () {
        var _this = this;
        $(document).on('click', 'a[data-modal]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var modalName = $(event.target).attr('data-modal');
            _this.modal = $('.modal[data-modal=' + modalName + ']');
            _this.open();
        });
        $(document).on('click', this.cover, function (event) {
            _this.close();
        });
    };
    Modal.prototype.open = function () {
        this.cover.addClass('active');
        this.modal.addClass('active');
        this.modal.css('top', $(window).scrollTop() + 100);
    };
    Modal.prototype.close = function () {
        this.modal.removeClass('active');
        this.cover.removeClass('active');
    };
    return Modal;
}());
