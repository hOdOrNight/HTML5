﻿/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/pocketCode/scripts/model/userVariable.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/userVariableHost.js" />
'use strict';

QUnit.module("userVariableHost.js");



QUnit.test("UserVariableHost", function (assert) {

    var uvhg = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.GLOBAL)
    var uvhl = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);

    assert.ok(uvhl instanceof PocketCode.UserVariableHost && uvhl instanceof SmartJs.Core.Component, "created: instance and inheritance check");

    //check cntr parameters
    assert.throws(function () { var test = new PocketCode.UserVariableHost(); }, Error, "ERROR: missing scope");
    assert.throws(function () { var test = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL, "string"); }, Error, "ERROR: invalid lookup");
    assert.throws(function () { var test = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.GLOBAL, uvhg); }, Error, "ERROR: lookup for global");
    assert.throws(function () { var test = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhl); }, Error, "ERROR: lookup host without global scope");

    //setter: we have to test the private (in this case protected) methods as these are used by gameEngine and sprite internally
    var vars = [];
    var lists = [];

    uvhl._variables = vars;
    uvhl._lists = lists;

    assert.throws(function () { uvhl.getVariable("id"); }, Error, "ERROR: variable not found");
    assert.throws(function () { uvhl.getList("id"); }, Error, "ERROR: list not found");

    //add global
    vars = [{ id: "id1", name: "var1", }, ];
    lists = [{ id: "id1", name: "list1", }, ];
    uvhg._variables = vars;
    uvhg._lists = lists;

    assert.equal(uvhl.getVariable("id1").name, "var1", "getter: variable (with global lookup)");
    assert.equal(uvhl.getList("id1").name, "list1", "getter: list: list and var with same name (with global lookup)");

    //set local
    vars = [{ id: "id1", name: "var1local", }, ];
    lists = [{ id: "id1", name: "list1local", }, ];
    uvhl._variables = vars;
    uvhl._lists = lists;
    assert.equal(uvhl.getVariable("id1").name, "var1local", "getter: variable (with same ids: this should not happen in our app as ids are uniquely generated server-side)");
    assert.equal(uvhl.getList("id1").name, "list1local", "getter: list: local and global same ids");

    uvhl.dispose();
    assert.ok(uvhl._disposed, "dispose");
    assert.deepEqual(uvhg.getVariable("id1").name, "var1", "dispose: lookup host not disposed (avoid impact on gameEngine)");

    //check object: return all vars or lists
    var compareAndAssert = function (allVarsOrLists, outputString, localDefinition, globalDefinition) {

        var valid = true;
        var tmp;
        for (var i = 0, l = localDefinition.length; i < l;i++) {
            tmp = allVarsOrLists.local[localDefinition[i].id];
            if (!tmp) {
                valid = false;
                break;
            }
        }
        if (valid) {
            for (var i = 0, l = globalDefinition.length; i < l; i++) {
                tmp = allVarsOrLists.global[globalDefinition[i].id];
                if (!tmp) {
                    valid = false;
                    break;
                }
            }
        }
        assert.ok(valid, outputString + "check object integrity");
    };

    //recreate: no local settings 
    vars = [{ id: "id1", name: "var1", }, { id: "id2", name: "var2", }, ];
    lists = [{ id: "id1", name: "list1", }, { id: "id2", name: "list2", }, ];
    uvhg._variables = vars;
    uvhg._lists = lists;

    uvhl = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);
    var v = uvhl.getAllVariables();
    compareAndAssert(v, "var: no local: ", {}, vars);
    var l = uvhl.getAllLists();
    compareAndAssert(l, "list: no local: ", {}, lists);

    //recreate: no global settings 
    uvhl = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL);
    uvhl._variables = vars;
    uvhl._lists = lists;
    v = uvhl.getAllVariables();
    compareAndAssert(v, "var: no global: ", vars, {});
    l = uvhl.getAllLists();
    compareAndAssert(l, "list: no global: ", lists, {});

    //recreate: local and global 
    uvhl = new PocketCode.UserVariableHost(PocketCode.UserVariableScope.LOCAL, uvhg);

    //vars = [{ id: "id1", name: "var1", }, ];
    //lists = [{ id: "id1", name: "list1", }, ];
    var varsl = [{ id: "id1", name: "var1local", }, { id: "id2", name: "var2local", }, ];
    var listsl = [{ id: "id1", name: "list1local", }, { id: "id2", name: "list2local", }, ];
    uvhl._variables = varsl;
    uvhl._lists = listsl;

    v = uvhl.getAllVariables();
    compareAndAssert(v, "var: local and global: ", varsl, vars);
    l = uvhl.getAllLists();
    compareAndAssert(l, "list: local and global: ", listsl, lists);

    var breakpoint = true;

});