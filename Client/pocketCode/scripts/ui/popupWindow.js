/// <reference path="../core.js" />
'use strict';


/**
 * popup dialog types
 * @type {{DEFAULT: string, WARNING: string, ERROR: string}}
 */
PocketCode.DialogType = {
    DEFAULT: 'default',
    WARNING: 'warning',
    ERROR:   'error'
};

PocketCode.Ui.popupWindow = ( function () {
    PopupWindow.extends( SmartJs.Ui.Control, false );

    //cntr
    function PopupWindow( dialogType, headerText, bodyText, footerText ) {

        if (dialogType !== PocketCode.DialogType.DEFAULT &&
            dialogType !== PocketCode.DialogType.WARNING &&
            dialogType !== PocketCode.DialogType.ERROR)
            throw new Error( 'Undefined type of popup window' );
        this._dialogType = dialogType;
        //this._dialogType = PocketCode.DialogType.DEFAULT;

        if ( headerText === '' )
            throw new Error( 'Empty PopUp Header Text' );
        if ( bodyText === '' )
            throw new Error( 'Empty PopUp Body Text' );
        if ( footerText === '' )
            throw new Error( 'Empty PopUp Footer Text' );


        var popUpContainer = document.createElement( 'div' );
        switch(this._dialogType) {
            case PocketCode.DialogType.DEFAULT:
                popUpContainer.className = 'pc-popup pc-popupDefaultBorder';
                //code block
                break;
            case PocketCode.DialogType.WARNING:
                popUpContainer.className = 'pc-popup pc-popupWarningBorder';
                //code block
                break;
            case PocketCode.DialogType.ERROR:
                popUpContainer.className = 'pc-popup pc-popupErrorBorder';
                //code block
                break;
        }

        //add header, body and footer:

        // ---- HEADER ----
        var popUpHeaderRow = document.createElement( 'div' );
        popUpHeaderRow.className = 'pc-webLayoutRow';
        var popUpHeader = document.createElement( 'div' );
        popUpHeader.className = 'pc-popupHeader';
        popUpHeader.innerHTML = headerText;
        popUpHeaderRow.appendChild( popUpHeader );
        // ---- ------ ----

        // ---- BODY ----
        var popUpBodyRow = document.createElement( 'div' );
        popUpBodyRow.className = 'pc-webLayoutRow';
        var popUpBody = document.createElement( 'div' );
        popUpBody.className = 'pc-popupBody';
        popUpBody.innerHTML = bodyText;
        popUpBodyRow.appendChild( popUpBody );
        // ---- ---- ----

        // ---- FOOTER ----
        var popUpFooterRow = document.createElement( 'div' );
        popUpFooterRow.className = 'pc-webLayoutRow';
        var popUpFooter = document.createElement( 'div' );
        popUpFooter.className = 'pc-popupFooter';
        popUpFooter.innerHTML = footerText;
        popUpFooterRow.appendChild( popUpFooter );
        // ---- ------ ----

        // add elements to popUpContainer div
        popUpContainer.appendChild( popUpHeaderRow );
        popUpContainer.appendChild( popUpBodyRow );
        popUpContainer.appendChild( popUpFooterRow );

    }

    PopupWindow.prototype.merge({
    });

    return PopupWindow;
})();
