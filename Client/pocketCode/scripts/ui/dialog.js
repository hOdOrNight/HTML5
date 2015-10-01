/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';


/**
 * dialog dialog types
 * @type {{DEFAULT: string, WARNING: string, ERROR: string}}
 */
PocketCode.Ui.DialogType = {
    DEFAULT: 0,
    WARNING: 1,
    ERROR: 2,
};

PocketCode.Ui.Dialog = (function () {
    Dialog.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function Dialog(type, caption) {
        SmartJs.Ui.ContainerControl.call(this, { className: 'pc-webOverlay' });

        //settings
        this._minHeight = 200;
        this._marginTopBottom = 15;

        //private controls
        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogHeader' });
        this._captionTextNode = new SmartJs.Ui.TextNode();
        this._header.appendChild(this._captionTextNode);

        //define the body as inner container
        this._container = new PocketCode.Ui.ScrollContainer({ className: 'pc-dialogBody' }, { className: 'pc-dialogContent' });
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogFooter' });// dialogFooterSingleButton' });

        this._createLayout();

        this._type = type || PocketCode.Ui.DialogType.DEFAULT;
        this.type = this._type;

        if (caption) {
            this.caption = caption;
        }

        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
    }

    //properties
    Object.defineProperties(Dialog.prototype, {
        type: {
            get: function () {
                return this._type;
            },
            set: function (value) {
                switch (value) {
                    case PocketCode.Ui.DialogType.DEFAULT:
                        this._header.className = 'pc-dialogHeader';
                        break;
                    case PocketCode.Ui.DialogType.WARNING:
                        this._header.className = 'pc-dialogHeader pc-dialogWarning';
                        break;
                    case PocketCode.Ui.DialogType.ERROR:
                        this._header.className = 'pc-dialogHeader pc-dialogError';
                        break;
                    default:
                        throw new Error('invalid argument: dialog type');
                }
                this._type = value;
            },
        },
        caption: {
            get: function () {
                return this._captionTextNode.text;
            },
            set: function (value) {
                if (typeof value !== 'string')
                    throw new error('invalid argument: caption: expected type = string');
                this._captionTextNode.text = value;
            },
        },
        bodyInnerHTML: {
            get: function () {
                return this._container.innerHTML;
            },
            set: function (value) {
                this._container.innerHTML = value;
            },
        },
    });

    //methods
    Dialog.prototype.merge({
        _createLayout: function () {
            var background = document.createElement('div');
            background.className = 'pc-overlay';
            this._dom.appendChild(background);

            var layout = document.createElement('div');
            layout.className = 'pc-webLayout';
            this._dom.appendChild(layout);

            var layoutRow = document.createElement('div');
            layoutRow.className = 'pc-webLayoutRow';
            layout.appendChild(layoutRow);

            var col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var center = document.createElement('div');
            center.className = 'pc-centerCol';
            layoutRow.appendChild(center);

            col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var dialog = new SmartJs.Ui.ContainerControl({ className: 'pc-dialog' });
            center.appendChild(dialog._dom);

            dialog.appendChild(this._header);
            dialog.appendChild(this._container);
            dialog.appendChild(this._footer);
            this._dialog = dialog;
        },
        /* override */
        verifyResize: function(caller) {
            SmartJs.Ui.ContainerControl.prototype.verifyResize.call(this, this);
            this._container.verifyResize(this);
        },
        _resizeHandler: function (e) {
            var availableHeight = this.height - (this._header.height + this._footer.height + 2 * this._marginTopBottom);
            var minHeight = this._minHeight - (this._header.height + this._footer.height);
            if (availableHeight > minHeight)
                this._container.style.maxHeight = availableHeight + 'px';
            else
                this._container.style.maxHeight = minHeight + 'px';
            //var width = this.width - 30;
            this._dialog.style.width = (this.width - 30) + 'px';//width + 'px';

            var buttons = this._footer._dom.children;
            for (var i = 0, l = buttons.length; i < l; i++)
                if (l == 1)
                    buttons[i].style.width = '100%';
                else
                    buttons[i].style.width = ((this._dialog.width - 2 * (l - 1)) / l) + 'px';

            //this._container.verifyResize(this); //=SmartJs.Ui.ContainerControl.prototype...
        },
        addButton: function (button) {
            if (!(button instanceof PocketCode.Ui.Button))
                throw new Error('invalid argument: button: expected type PocketCode.Ui.Button');

            var count = this._footer._dom.children.length;
            if (count > 1)
                throw new Error('add button: there are currently 2 buttons supported at max');

            this._footer.appendChild(button);
            //if (count == 1)
            //    this._footer.replaceClassName('dialogFooterSingleButton', 'dialogFooterTwoButtons');
        },
        handleHistoryBack: function () {
            //this method should be overridden to implement specific functionality on browser-back navigation
            //e.g. calling dispatch() on the default buttons click event
            if (this.onCancel)
                this.onCancel.dispatchEvent();
            else if (this.onOK)
                this.onOK.dispatchEvent();
        },
    });

    return Dialog;
})();

PocketCode.Ui.merge({
    GlobalErrorDialog: (function () {
        GlobalErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function GlobalErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Global Error');
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>. A global exception was detected. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.';
        }

        //events
        Object.defineProperties(GlobalErrorDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //GlobalErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return GlobalErrorDialog;
    })(),

    BrowserNotSupportedDialog: (function () {
        BrowserNotSupportedDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function BrowserNotSupportedDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Framework Not Supported');
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'This application makes use of many html5 features but is tested to be compatible with the latest versions of all common browsers. <br />We�re sorry, but your browser does not meet the minimal requirements to run this application.<br />Please try again using another browser.';
        }

        //events
        Object.defineProperties(BrowserNotSupportedDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //BrowserNotSupportedDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return BrowserNotSupportedDialog;
    })(),

    MobileRestrictionDialog: (function () {
        MobileRestrictionDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function MobileRestrictionDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'Please Confirm');
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnConfirm = new PocketCode.Ui.Button('Confirm');
            this.addButton(this._btnConfirm);

            this.bodyInnerHTML = 'Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.<br /><br />';
            this.bodyInnerHTML += 'There is currently NO official support for mobile devices- this is an experimental preview only! So please do NOT file bugs until there is an official release available.';
        }

        //events
        Object.defineProperties(MobileRestrictionDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onConfirm: {
                get: function () {
                    return this._btnConfirm.onClick;
                },
            },
        });

        //methods
        //MobileRestrictionDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return MobileRestrictionDialog;
    })(),

    ProjectNotFoundDialog: (function () {
        ProjectNotFoundDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectNotFoundDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Project Not Found');
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting could not be found on our server. Plese make sure you are using a valid Project ID.';
        }

        //events
        Object.defineProperties(ProjectNotFoundDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ProjectNotFoundDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ProjectNotFoundDialog;
    })(),

    ProjectNotValidDialog: (function () {
        ProjectNotValidDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ProjectNotValidDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Project Not Valid');
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting has an invalid file structure or missing resources.<br/>Details:<br/>';
        }

        //events
        Object.defineProperties(ProjectNotValidDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ProjectNotValidDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ProjectNotValidDialog;
    })(),

    ParserErrorDialog: (function () {
        ParserErrorDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function ParserErrorDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.ERROR, 'Error Parsing Project');
            this._btnOK = new PocketCode.Ui.Button('OK');
            this.addButton(this._btnOK);

            this.bodyInnerHTML = 'We are sorry.<br/>The project you are requesting could not be parsed correctly on our server. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.';
        }

        //events
        Object.defineProperties(ParserErrorDialog.prototype, {
            onOK: {
                get: function () {
                    return this._btnOK.onClick;
                },
            },
        });

        //methods
        //ParserErrorDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onOK.dispatchEvent();
        //    },
        //});

        return ParserErrorDialog;
    })(),

    UnsupportedSoundFileDialog: (function () {
        UnsupportedSoundFileDialog.extends(PocketCode.Ui.Dialog, false);

        //cntr
        function UnsupportedSoundFileDialog() {
            PocketCode.Ui.Dialog.call(this, PocketCode.Ui.DialogType.WARNING, 'Unsupported Sound File');
            this._btnCancel = new PocketCode.Ui.Button('Cancel');
            this.addButton(this._btnCancel);
            this._btnContinue = new PocketCode.Ui.Button('Continue');
            this.addButton(this._btnContinue);

            this.bodyInnerHTML = 'We have detected a sound file (or codec) that is not compatible with your current browser.<br />You can run the project anyway- unsupported sounds will be ignored.';
        }

        //events
        Object.defineProperties(UnsupportedSoundFileDialog.prototype, {
            onCancel: {
                get: function () {
                    return this._btnCancel.onClick;
                },
            },
            onContinue: {
                get: function () {
                    return this._btnContinue.onClick;
                },
            },
        });

        //methods
        //UnsupportedSoundFileDialog.prototype.merge({
        //    /* override */
        //    handleHistoryBack: function () {
        //        this.onCancel.dispatchEvent();
        //    },
        //});

        return UnsupportedSoundFileDialog;
    })(),

});