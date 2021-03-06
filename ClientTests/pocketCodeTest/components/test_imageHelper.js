﻿/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/imageHelper.js" />
'use strict';

QUnit.module("components/imageHelper.js");

QUnit.test("ImageFilter: whirl", function (assert) {

    assert.ok(false, "TODO: tests");
});

QUnit.test("ImageFilter: fisheye", function (assert) {

    assert.ok(false, "TODO: tests");
});

QUnit.test("ImageFilter: pixelate", function (assert) {

    assert.ok(false, "TODO: tests");
});

QUnit.test("ImageFilter: mosaic", function (assert) {

    assert.ok(false, "TODO: tests");
});

QUnit.test("ImageFilter: color", function (assert) {
    var originalPixelData = [
        1, 2, 3, 4,
        7, 8, 9, 17,
        3, 3, 2, 15
    ];

    var originalHsvToRgb = PocketCode.ImageHelper.hsvToRgb;
    PocketCode.ImageHelper.hsvToRgb = function(h, s, v){
        return {r: h, g: s, b: v};
    };

    var originalRgbToHsv = PocketCode.ImageHelper.rgbToHsv;
    PocketCode.ImageHelper.rgbToHsv = function(r, g, b){
        return {h: r, s: g, v: b};
    };

    var modifiedData = originalPixelData.slice(0);

    PocketCode.ImageFilter.color(modifiedData, 0);
    assert.deepEqual(modifiedData, originalPixelData, "no change made to color if color is 0");

    var colorShift = 25;
    PocketCode.ImageFilter.color(modifiedData, colorShift);

    var checkData = function () {
        var expectedColorShift = (colorShift % 200) / 200 * 360;
        var dataAsExpected = true;
        for (var i = 0, l = modifiedData.length; i < l; i++) {
            //only h value shifted
            if ((i % 4) !== 0) {
                if(originalPixelData[i] !== modifiedData[i]){
                    dataAsExpected = false;
                }
            } else if ((originalPixelData[i] + expectedColorShift) < 0){
                if(modifiedData[i] !== (originalPixelData[i] + expectedColorShift + 360))
                    dataAsExpected = false
            } else {
                if (modifiedData[i] !== ((originalPixelData[i] + expectedColorShift) % 360))
                    dataAsExpected = false;
            }
        }
        return dataAsExpected;
    };

    assert.ok(checkData(), "Color shifted correctly positive value");

    colorShift = -35;
    modifiedData = originalPixelData.slice(0);
    PocketCode.ImageFilter.color(modifiedData, colorShift);
    assert.ok(checkData(), "Color shifted correctly negative value");

    colorShift = 400;
    modifiedData = originalPixelData.slice(0);
    PocketCode.ImageFilter.color(modifiedData, colorShift);
    assert.ok(checkData(), "Color shifted correctly large value");

    PocketCode.ImageHelper.hsvToRgb = originalHsvToRgb;
    PocketCode.ImageHelper.rgbToHsv = originalRgbToHsv;
});

QUnit.test("ImageFilter: brightness", function (assert) {
    var originalPixelData = [
        1, 2, 3, 4,
        7, 8, 9, 17,
        3, 3, 2, 15
    ];

    var modifiedData = originalPixelData.slice(0);

    PocketCode.ImageFilter.brightness(modifiedData, 0);
    assert.deepEqual(modifiedData, originalPixelData, "no change made to brightness if brightness is 0");

    var brightnessChange = 10;
    modifiedData = originalPixelData.slice(0);
    PocketCode.ImageFilter.brightness(modifiedData, brightnessChange);

    var dataAsExpected = true;

    for (var i = 0, l = modifiedData.length; i < l; i++) {
        if ((i % 4) !== 3){
            if (modifiedData[i] !== (originalPixelData[i] + Math.round(brightnessChange * 2.55))) {
                dataAsExpected = false;
            }
        } else if (modifiedData[i] !== originalPixelData[i]){
            dataAsExpected = false;
        }
    }
    assert.ok(dataAsExpected, "applyBrightnessFilter: correct change made to brightness if brightness is not 0");
});


QUnit.test("ImageHelper", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var done6 = assert.async();
    //var done7 = assert.async();

    //helper function to limit rounding errors
    var round1000 = function (value) {
        return Math.round(value * 1000) / 1000;
    };

    var img1, img2, img3, img4, img5, img6, img7, img8, img9, img11,
        ih = PocketCode.ImageHelper;

    var imgLoadCounter = 0;
    var imgLoadHandler = function () {
        imgLoadCounter++;
        if (imgLoadCounter == 10) //all loaded
            runTests_Scale();
    };

    //init images to use
    img1 = new Image();
    img1.addEventListener("load", imgLoadHandler);
    img1.src = "_resources/images/imgHelper1.png";

    img2 = new Image();
    img2.addEventListener("load", imgLoadHandler);
    img2.src = "_resources/images/imgHelper2.png";

    img3 = new Image();
    img3.addEventListener("load", imgLoadHandler);
    img3.src = "_resources/images/imgHelper3.png";

    img4 = new Image();
    img4.addEventListener("load", imgLoadHandler);
    img4.src = "_resources/images/imgHelper4.png";

    img5 = new Image();
    img5.addEventListener("load", imgLoadHandler);
    img5.src = "_resources/images/imgHelper5.png";

    img6 = new Image();
    img6.addEventListener("load", imgLoadHandler);
    img6.src = "_resources/images/imgHelper6.png";

    img7 = new Image();
    img7.addEventListener("load", imgLoadHandler);
    img7.src = "_resources/images/imgHelper7.png";

    img8 = new Image();
    img8.addEventListener("load", imgLoadHandler);
    img8.src = "_resources/images/imgHelper8.png";

    img9 = new Image();
    img9.addEventListener("load", imgLoadHandler);
    img9.src = "_resources/images/imgHelper9.png";

    img11 = new Image();
    img11.addEventListener("load", imgLoadHandler);
    img11.src = "_resources/images/imgHelper11.png";


    //scale(img, scalingFactor)
    var runTests_Scale = function () {

        assert.throws(function () { ih.scale("image"); }, Error, "ERROR: scale: argument check: image");
        assert.throws(function () { ih.scale(new Image(), "asd"); }, Error, "ERROR: scale: argument check: scaling factor");
        //assert.throws(function () { ih.scale(img8); }, Error, "ERROR: scale: argument check: scaling factor undefined");

        var oImg = ih.scale(img8);
        assert.ok(oImg.width == img8.width && oImg.height == img8.height, "scaling factor undefined -> sclaing = 1");
        assert.ok(oImg instanceof HTMLCanvasElement, "returns a canvas");
        ih.setImageSmoothing(oImg.getContext('2d'));
        //assert.ok(oImg.imageSmoothingEnabled, true, "setter: image smoothing enabled");

        oImg = ih.scale(img8, 0);
        assert.ok(oImg.width == 0 && oImg.height == 0, "scaling factor == 0");
        oImg = ih.scale(img8, -0.1);
        assert.ok(oImg.width == 0 && oImg.height == 0, "negative scaling factor");

        oImg = ih.scale(img8, 2);
        assert.ok(oImg.height == img8.height * 2 && oImg.width == img8.width * 2, "upscaling proportions: h:" + oImg.height + ", w:" + oImg.width);

        var oImg2 = ih.scale(img9, 0.3);
        assert.ok(oImg2.height == Math.ceil(img9.height * 0.3) && oImg2.width == Math.ceil(img9.width * 0.3), "upscaling proportions: rounding h:" + oImg2.height + ", w:" + oImg2.width);

        var canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 150;
        var c = ih.scale(canvas, 0.02);
        assert.ok(c.width == 1 && c.height == 3, "scaling canvas element");

        done1();
        runTests_getBoundingSize();
    };

    //getBoundingSize(element, scaling, rotation)
    var runTests_getBoundingSize = function () {

        assert.throws(function () { ih.getBoundingSize(""); }, Error, "ERROR: argument check");
        var canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 150;
        var size = ih.getBoundingSize(canvas, 0.5);
        assert.ok(size.height == canvas.height * 0.5 && size.width == canvas.width * 0.5, "bounding size without rotate");
        canvas.height = 50;
        var d = 2 * canvas.height / Math.sqrt(2);
        d *= 2; //apply scaling
        size = ih.getBoundingSize(canvas, 2, 45);
        assert.ok(round1000(size.height) == round1000(d) && round1000(size.width) == round1000(d), "bounding size including rotate");
        
        done2();
        runTests_getImageTrimOffsets();
    };

    //getElementTrimOffsets(img, scaling, rotation, top, right, bottom, left)
    var runTests_getImageTrimOffsets = function () {

        //argument check
        assert.throws(function () { ih.getElementTrimOffsets("image"); }, Error, "ERROR: argument check: getElementTrimOffsets");
        assert.throws(function () { ih.getDataTrimOffsets([], 12, 12); }, Error, "ERROR: argument check: getDataTrimOffsets");

        //simple
        var offsets = ih.getElementTrimOffsets(img1);
        assert.ok(offsets.top == 7 && offsets.right == 2 && offsets.bottom == 0 && offsets.left == 0, "simple: combined");
        offsets = ih.getElementTrimOffsets(img6);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "simple: filled");
        offsets = ih.getElementTrimOffsets(img7);  //transparent
        assert.ok(offsets.top == 8 && offsets.right == 10 && offsets.bottom == 8 && offsets.left == 10, "simple: transparent");
        offsets = ih.getElementTrimOffsets(img8);  //centered
        assert.ok(offsets.top == 2 && offsets.right == 3 && offsets.bottom == 2 && offsets.left == 3, "simple: centered");
        offsets = ih.getElementTrimOffsets(img9);
        assert.ok(offsets.top == 243 && offsets.right == 106 && offsets.bottom == 339 && offsets.left == 143, "simple: large");

        //rotate: 90
        var offsets = ih.getElementTrimOffsets(img1, 90);
        assert.ok(offsets.top == 0 && offsets.right == 7 && offsets.bottom == 2 && offsets.left == 0, "rotate: 90: combined");
        offsets = ih.getElementTrimOffsets(img6, 90);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "rotate: 90: filled");
        offsets = ih.getElementTrimOffsets(img7, 90);  //transparent
        assert.ok(offsets.top == 10 && offsets.right == 8 && offsets.bottom == 10 && offsets.left == 8, "rotate: 90: transparent");
        offsets = ih.getElementTrimOffsets(img8, 90);  //centered
        assert.ok(offsets.top == 3 && offsets.right == 2 && offsets.bottom == 3 && offsets.left == 2, "rotate: 90: centered (may be a scaling issue in mozilla?)");
        offsets = ih.getElementTrimOffsets(img9, 90);
        assert.ok(offsets.top == 143 && offsets.right == 243 && offsets.bottom == 106 && offsets.left == 339, "rotate: 90: large");

        //precision
        var offsets = ih.getElementTrimOffsets(img1, 90, 0.5);
        assert.ok(offsets.top == 0 && offsets.right <= 7 && offsets.bottom <= 2 && offsets.left == 0, "precision: rotate: 90: combined");
        offsets = ih.getElementTrimOffsets(img6, 90, 0.5);  //full
        assert.ok(offsets.top == 0 && offsets.right == 0 && offsets.bottom == 0 && offsets.left == 0, "precision: rotate: 90: filled");
        offsets = ih.getElementTrimOffsets(img7, 90, 0.5);  //transparent
        assert.ok(offsets.top == 10 && offsets.right == 8 && offsets.bottom == 10 && offsets.left == 8, "precision: rotate: 90: transparent");
        offsets = ih.getElementTrimOffsets(img8, 90, 0.5);  //centered
        assert.ok(offsets.top <= 3 && offsets.right <= 2 && offsets.bottom <= 3 && offsets.left <= 2, "precision: rotate: 90: centered (may be a scaling issue in mozilla?)");
        offsets = ih.getElementTrimOffsets(img9, 90, 0.5);
        assert.ok(offsets.top <= 143 && offsets.right <= 243 && offsets.bottom <= 106 && offsets.left <= 339, "precision: rotate: 90: large");

        done3();
        runTests_adjustCenterAndTrim();
    };

    //adjustCenterAndTrim(img, rotationCenterX, rotationCenterY, includeBoundingCorners)
    var runTests_adjustCenterAndTrim = function () {

        //argument check
        assert.throws(function () { ih.adjustCenterAndTrim("image"); }, Error, "ERROR: invlaid image argument");
        //assert.throws(function () { ih.adjustCenterAndTrim(img8, "a", 3); }, Error, "ERROR: invlaid rotationCenter argument");

        //simple
        var oImg9 = ih.adjustCenterAndTrim(img9, /*undefined, undefined,*/ true);  //we start with the slowest and hope that loading time will not effect our tests
        var oImg8 = ih.adjustCenterAndTrim(img8, /*undefined, undefined,*/ true);
        var oImg7 = ih.adjustCenterAndTrim(img7, /*undefined, undefined,*/ true);
        var oImg6 = ih.adjustCenterAndTrim(img6, /*undefined, undefined,*/ true);
        var oImg5 = ih.adjustCenterAndTrim(img5, /*undefined, undefined,*/ true);
        var oImg4 = ih.adjustCenterAndTrim(img4, /*undefined, undefined,*/ true);
        var oImg3 = ih.adjustCenterAndTrim(img3, /*undefined, undefined,*/ true);
        var oImg2 = ih.adjustCenterAndTrim(img2, /*undefined, undefined,*/ true);
        var oImg1 = ih.adjustCenterAndTrim(img1, /*undefined, undefined,*/ true);

        var m = oImg1.center, //{ length: , angle: }
            img = oImg1.canvas,
            x = m.length * Math.cos(m.angle),
            y = m.length * Math.sin(m.angle),
            tl = oImg1.tl,
            tr = oImg1.tr,
            bl = oImg1.bl,
            br = oImg1.br;
        assert.ok(img.height == 1 && img.width == 8, "img1 cut");
        assert.ok(round1000(x) == - 1 && round1000(y) == -3.5, "img1 recentered");
        x = tl.length * Math.cos(tl.angle);
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -3, "top left corner vector checked");
        x = tr.length * Math.cos(tr.angle);
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 3 && round1000(y) == -3, "top right corner vector checked");
        x = bl.length * Math.cos(bl.angle);
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -4, "bottom left corner vector checked");
        x = br.length * Math.cos(br.angle);
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 3 && round1000(y) == -4, "bottom right corner vector checked");

        m = oImg2.center, //{ length: , angle: }
        img = oImg2.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle),
        tl = oImg2.tl,
        tr = oImg2.tr,
        bl = oImg2.bl,
        br = oImg2.br;
        assert.ok(img.height == 1 && img.width == 8, "img2 cut");
        assert.ok(round1000(x) == 1 && round1000(y) == 3.5, "img2 recentered");
        x = tl.length * Math.cos(tl.angle);
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 4, "top left corner vector checked");
        x = tr.length * Math.cos(tr.angle);
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 5 && round1000(y) == 4, "top right corner vector checked");
        x = bl.length * Math.cos(bl.angle);
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 3, "bottom left corner vector checked");
        x = br.length * Math.cos(br.angle);
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 5 && round1000(y) == 3, "bottom right corner vector checked");

        m = oImg3.center, //{ length: , angle: }
        img = oImg3.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 4 && img.width == 4, "img3 cut");
        assert.ok(round1000(x) == -1 && round1000(y) == 1, "img3 recentered");

        m = oImg4.center, //{ length: , angle: }
        img = oImg4.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 7 && img.width == 1, "img4 cut");
        assert.ok(round1000(x) == -4.5 && round1000(y) == 0.5, "img4 recentered");

        m = oImg5.center, //{ length: , angle: }
        img = oImg5.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 1, "img5 cut");
        assert.ok(round1000(x) == 4.5 && round1000(y) == 0, "img5 recentered");

        m = oImg6.center, //{ length: , angle: }
        img = oImg6.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 8 && img.width == 10, "img6 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img6 recentered");

        m = oImg7.center, //{ length: , angle: }
        img = oImg7.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 0 && img.width == 0, "img7 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered");

        m = oImg8.center, //{ length: , angle: }
        img = oImg8.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 4 && img.width == 4, "img8 cut");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "img8 recentered");

        m = oImg9.center, //{ length: , angle: }
        img = oImg9.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 602 && img.width == 471, "img9 cut");
        assert.ok(round1000(x) == 18.5 && round1000(y) == 48, "img9 recentered");

        //quick check canvas call
        var c = ih.adjustCenterAndTrim(img);
        m = c.center,
        img = c.canvas,
        x = m.length * Math.cos(m.angle),
        y = m.length * Math.sin(m.angle);
        assert.ok(img.height == 602 && img.width == 471, "calling method using canvas element: size- make sure there is no trim-area after first trim");
        assert.ok(round1000(x) == 0 && round1000(y) == 0, "calling method using canvas element: resized- make sure there is no trim-area after first trim");

        ////individual rotation center applied
        //oImg9 = ih.adjustCenterAndTrim(img9, img9.width * 0.5, img9.height * 0.5);
        //oImg8 = ih.adjustCenterAndTrim(img8, img8.width, 0);
        //oImg7 = ih.adjustCenterAndTrim(img7, 3, 3);
        //oImg6 = ih.adjustCenterAndTrim(img6, img6.width, img6.height);
        //oImg5 = ih.adjustCenterAndTrim(img5, 0, img5.height);
        //oImg4 = ih.adjustCenterAndTrim(img4, 4, 3);

        //m = oImg4.center, //{ length: , angle: }
        //img = oImg4.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 7 && img.width == 1, "img4 cut (individual rotation center)");
        //assert.ok(round1000(x) == -3.5 && round1000(y) == -0.5, "img4 recentered (individual rotation center)");

        //m = oImg5.center, //{ length: , angle: }
        //img = oImg5.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 8 && img.width == 1, "img5 cut (individual rotation center)");
        //assert.ok(round1000(x) == 9.5 && round1000(y) == 4, "img5 recentered (individual rotation center)");

        //m = oImg6.center, //{ length: , angle: }
        //img = oImg6.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 8 && img.width == 10, "img6 cut (individual rotation center)");
        //assert.ok(round1000(x) == -5 && round1000(y) == 4, "img6 recentered (individual rotation center)");

        //m = oImg7.center, //{ length: , angle: }
        //img = oImg7.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 0 && img.width == 0, "img7 cut (individual rotation center)");
        //assert.ok(round1000(x) == 0 && round1000(y) == 0, "img7 recentered (individual rotation center)");

        //m = oImg8.center, //{ length: , angle: }
        //img = oImg8.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 4 && img.width == 4, "img8 cut (individual rotation center)");
        //assert.ok(round1000(x) == -5 && round1000(y) == -4, "img8 recentered (individual rotation center)");

        //m = oImg9.center, //{ length: , angle: }
        //img = oImg9.canvas,
        //x = m.length * Math.cos(m.angle),
        //y = m.length * Math.sin(m.angle);
        //assert.ok(img.height == 602 && img.width == 471, "img9 cut (individual rotation center)");
        //assert.ok(round1000(x) == 18.5 && round1000(y) == 48, "img9 recentered (individual rotation center)");

        //include vectors to bounding corners
        oImg4 = ih.adjustCenterAndTrim(img4, /*undefined, undefined,*/ true);
        var tl = oImg4.tl;
        x = tl.length * Math.cos(tl.angle),
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == 4, "img4: tl corner vector");
        var tr = oImg4.tr;
        x = tr.length * Math.cos(tr.angle),
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == -4 && round1000(y) == 4, "img4: tr corner vector");
        var bl = oImg4.bl;
        x = bl.length * Math.cos(bl.angle),
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -5 && round1000(y) == -3, "img4: bl corner vector");
        var br = oImg4.br;
        x = br.length * Math.cos(br.angle),
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == -4 && round1000(y) == -3, "img4: br corner vector");

        oImg3 = ih.adjustCenterAndTrim(img3, /*undefined, undefined,*/ true);
        tl = oImg3.tl;
        x = tl.length * Math.cos(tl.angle),
        y = tl.length * Math.sin(tl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == 3, "img3: tl corner vector");
        tr = oImg3.tr;
        x = tr.length * Math.cos(tr.angle),
        y = tr.length * Math.sin(tr.angle);
        assert.ok(round1000(x) == 1 && round1000(y) == 3, "img3: tr corner vector");
        bl = oImg3.bl;
        x = bl.length * Math.cos(bl.angle),
        y = bl.length * Math.sin(bl.angle);
        assert.ok(round1000(x) == -3 && round1000(y) == -1, "img3: bl corner vector");
        br = oImg3.br;
        x = br.length * Math.cos(br.angle),
        y = br.length * Math.sin(br.angle);
        assert.ok(round1000(x) == 1 && round1000(y) == -1, "img3: br corner vector");

        oImg7 = ih.adjustCenterAndTrim(img7, /*undefined, undefined,*/ true);   //check transparent
        tl = oImg7.tl;
        assert.ok(tl.length == 0 && tl.angle == 0, "check return value on transparent images");
        done4();
        runTests_setFilters();
    };

    //filters
    var runTests_setFilters = function () {

        var canvas = document.createElement("canvas");
        canvas.width = 20;
        canvas.height = 10;
        assert.throws(function () { ih.setFilters("canvas", []); }, Error, "ERROR: invalid argument canvas");
        assert.throws(function () { ih.setFilters(canvas); }, Error, "ERROR: invalid argument filters");

        ih.setFilters(canvas, []);  //code coverage
        assert.throws(function () { ih.setFilters(canvas, [{ effect: undefined, value: 4 }]); }, Error, "ERROR: invalid filter argument: effect");
        //assert.throws(function () { ih.setFilters(canvas, [{ effect: PocketCode.GraphicEffect.COLOR, value: undefined }]); }, Error, "ERROR: invalid filter argument: value");
        ih.setFilters(canvas, [{ effect: PocketCode.GraphicEffect.COLOR, value: 4 }]);

        //call all existing filters once
        ih.setFilters(canvas, [
            { effect: PocketCode.GraphicEffect.WHIRL, value: 4 },
            { effect: PocketCode.GraphicEffect.FISHEYE, value: 4 },
            { effect: PocketCode.GraphicEffect.PIXELATE, value: 4 },
            { effect: PocketCode.GraphicEffect.MOSAIC, value: 4 },
            { effect: PocketCode.GraphicEffect.COLOR, value: 4 },
            { effect: PocketCode.GraphicEffect.GHOST, value: 4 },
            { effect: PocketCode.GraphicEffect.BRIGHTNESS, value: 4 }]);

        done5();
        runTests_rgbHsvConversion();
    };

    // h: 0 - 360
    // s: 0 - 1
    // v: 0 - 255
    var runTests_rgbHsvConversion = function () {
        //when adding values accuracy and ranges need to be taken into account. e.g. s goes from 0 - 1 and not from 0-100
        var hsvRgbMapping = [
            {
                hsv: {h: 0, s: 0.5, v: 255},
                rgb: {r: 255, g: 128, b: 128}
            },
            {
                hsv: {h: 0, s: 0, v: 0},
                rgb: {r: 0, g: 0, b: 0}
            },
            {
                hsv: {h: 30, s: 0.57, v: 77},
                rgb: {r: 77, g: 55, b: 33}
            },
            {
                hsv: {h: 337.2, s: 0.98, v: 255},
                rgb: {r: 255, g: 5, b: 100}
            },
            {
                hsv: {h: 0, s: 0, v: 50},
                rgb: {r: 50, g: 50, b: 50}
            },
            {
                hsv: {h: 0, s: 0, v: 50},
                rgb: {r: 50, g: 50, b: 50}
            },
            {
                hsv: {h: 0, s: 0, v: 255},
                rgb: {r: 255, g: 255, b: 255}
            },
            {
                hsv: { h: 213.06, s: 0.76, v: 194 },
                rgb: { r: 47, g: 113, b: 194 }
            },
            {
                hsv: { h: 270.57, s: 0.82, v: 194 },
                rgb: { r: 116, g: 35, b: 194 }
            },
            {
                hsv: { h: 25.31, s: 0.76, v: 194 },
                rgb: { r: 194, g: 109, b: 47 }
            },
            {
                hsv: { h: 100.43, s: 0.9, v: 255 },
                rgb: { r: 100, g: 255, b: 25 }
            },
            {
                hsv: { h: 124.79, s: 0.99, v: 240 },
                rgb: { r: 2, g: 240, b: 21 }
            },

        ];

        for(var i = 0, l = hsvRgbMapping.length; i < l; i++){
            assert.propEqual(ih.rgbToHsv(hsvRgbMapping[i].rgb.r, hsvRgbMapping[i].rgb.g, hsvRgbMapping[i].rgb.b), hsvRgbMapping[i].hsv, "rgb to hsv conversion worked as expected: " + i);
            assert.propEqual(ih.hsvToRgb(hsvRgbMapping[i].hsv.h, hsvRgbMapping[i].hsv.s, hsvRgbMapping[i].hsv.v), hsvRgbMapping[i].rgb, "hsv to rgb conversion worked as expected: " + i);
        }

        done6();
        //runTests_findObjects();

    };
    //var runTests_findObjects = function () {
    //    var canvas = document.createElement('canvas');
    //    var ctx=canvas.getContext("2d");
    //    ctx.rect(20,20,10,5);
    //    ctx.fill();

    //    done7();
    //}

});

