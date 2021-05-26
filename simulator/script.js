function chooseText() {
    createText();
    displayText();
}

function createText() {
    /*
    <div id="createText">
        <label for="textInput">Entrez votre texte : </label>
        <input type="text" id="choosetextInput" />
        <button id="deleteFieldText">Effacer</button>
    </div>
    */

    let div = document.createElement("div");
    $(div).attr("id", "createText");
    let label = document.createElement("label");
    $(label).attr("for", "textInput");
    $(label).text(getMsg("enter_text"));
    let input = document.createElement("input");
    $(input).attr("type", "text");
    $(input).attr("id", "choosetextInput");
    let button = $(document.createElement("button")).on("click", function() {$("#choosetextInput").val("");});
    $(button).attr("id", "deleteFieldText");
    $(button).text(getMsg("delete"));
    $(div).append(label);
    $(div).append(input);
    $(div).append(button);
    $("body").append(div);
}

function displayText() {
    $("#createText").dialog({
        width: 500,
        maxHeight: 300,
        title: getMsg("choose_text"),
        modal: true,
        close: function(e, ui) {
            $("#createText").remove();
        },
        buttons: {"Ok": function(t) {
            let choosenText = $("#choosetextInput").val();
            if(Boolean(choosenText)) {
                text = choosenText;
                $("#createText").remove();
            }
        }, "Cancel": function(t) {
            $("#createText").remove();
        }
        }
      });
}

function createModalProperties(element) {
  /* 
      <div id="elementInGr">
          <table>
              <thead>
                  <tr>
                      <td>Type</td><td>Indice de refraction</td>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Halfplane</td><td>1,5</td>
                  </tr>
              </tbody>
          </table>
      </div>
  */

  let div = document.createElement('div');
  $(div).attr("id", "elementInGr");
  $(div).css("display","none");
  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let trH = document.createElement('tr');
  $(trH).addClass("table-primary");

  let type = document.createElement('td');
  $(type).text(getMsg("type"));
  let indice = document.createElement('td');
  $(indice).text(getMsg("properties"));
  $(trH).append(type); $(trH).append(indice);

  $(thead).append(trH);
  $(table).append(thead);

  let tbody = document.createElement('tbody');
  if(element[0] != undefined) {
    for(let i = 0; i < element[0].length; i++) {
        let tr = document.createElement('tr');
        for(let j = 0; j < 2; j++) {
            let td = document.createElement('td');
            if(j == 0) $(td).text(getMsg("tool_" + element[0][i].type));
            if(j == 1) $(td).text(element[0][i].p);
            $(tr).append(td);
        }
        $(tbody).append(tr);
    }
  }
  $(table).append(tbody);
  $(div).append(table);
  $("body").append(div);
}

function createGroupPanel() {
  /*
  <div id="sideMultipleGroup">
      <table>
          <thead>
              <tr class="table-primary">
                  <td>Nom</td><td>Supprimer</td><td>Selectionner</td>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td colspan=3><button type="button" class="btn btn-outline-primary btn-sm">Jonquille</button></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Jonquille</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Rose</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Tulipe</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Hibiscus</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Sakura</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Bouton d'or</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
          </tbody>
      </table>
  </div> 
  */

  let div = document.createElement("div");
  $(div).attr("id", "sideMultipleGroup");
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tr1 = document.createElement("tr");
  $(tr1).addClass("table-primary");
  for(let indexTR1 = 0; indexTR1 < 3; indexTR1++) {
      let td1 = document.createElement("td");
      if(indexTR1 == 0) $(td1).text(getMsg("name"));
      if(indexTR1 == 1) $(td1).text(getMsg("delete"));
      if(indexTR1 == 2) $(td1).text(getMsg("select"));
      $(tr1).append(td1);
  }
  $(thead).append(tr1);
  $(table).append(thead);

  let tbody = document.createElement("tbody");

  let ungroupTR = document.createElement("tr");
  let ungroupTD = document.createElement("td");
  let ungroupButton = document.createElement("button");
  $(ungroupButton).attr("type", "button");
  $(ungroupButton).addClass("btn btn-outline-primary btn-sm");
  $(ungroupButton).text(getMsg("unselect"));
  $(ungroupTD).append(ungroupButton);
  $(ungroupTD).attr("colspan", "3");
  $(ungroupTD).attr("id", "ungroup");
  $(ungroupTR).append(ungroupTD); $(tbody).append(ungroupTR);

  for(let indexTR2 = 0; indexTR2 < selectGr.length; indexTR2++) {
      let tr = document.createElement("tr");
      for(let indexTD1 = 0; indexTD1 < 3; indexTD1++) {
          let td = document.createElement("td");
          let el;
          if(indexTD1 == 0) {
              el = document.createElement("button");
              $(el).attr("type", "button");
              $(el).addClass("btn btn-outline-primary btn-sm");
              $(el).text(selectGr[indexTR2].name);
          }
          if(indexTD1 == 1) {
              el = document.createElement("button");
              $(el).attr("type", "button");
              $(el).attr("id", "deleteGr");
              $(el).addClass("btn btn-primary btn-sm");
              $(el).text(getMsg("delete"));
          }
          if(indexTD1 == 2) {
              el = document.createElement("input");
              $(el).attr("type", "radio");
              $(el).attr("name", "multipleGr");
              if(currentSelectedGr[0] != undefined)
              if(currentSelectedGr[0].name == selectGr[indexTR2].name)
              $(el).attr("checked", "true")
          }
          $(td).append(el);
          $(tr).append(td);
      }
      $(tbody).append(tr);
  }
  $(table).append(tbody);
  $(div).append(table);
  $("body").append(div);

  //Name button
  addDisplayElementsListenerForGroup();

  //Delete button
  addDeleteListenerForGroup();

  //Select radio button
  addSelectListenerForGroup();
}

function addDisplayElementsListenerForGroup() {
    $("#sideMultipleGroup tbody tr td:first-child button").on("click", function () {
        if ($(this).parent().attr("id") == "ungroup")
            return;
        let group = $(this).text();
        let currentElementArray = [];
        for (c of selectGr) {
            if (group == c.name)
                currentElementArray.push(c.elements);
        }

        createModalProperties(currentElementArray);
        $("#elementInGr").dialog({
            title: group,
            modal: true,
            close: function (e, ui) {
                $("#elementInGr").remove();
            }
        });

    });
}

function addSelectListenerForGroup() {
    $("#sideMultipleGroup tbody tr td:last-child").on("click", function () {
        if (this.id == "ungroup") {
            isMovingMultipleObject = false;
            isSettingRotationPoint = false;
            currentSelectedGr = [];
            for (r of $(this).parent().parent().find("tr")) {
                $(r).children().eq(2).children().prop("checked", false);
            }
            return;
        }
        $(this).children().prop("checked", true);
        let group = $(this).prev().prev().text();
        isMovingMultipleObject = true;
        currentSelectedGr = [];
        for (c of selectGr) {
            if (group == c.name) {
                currentSelectedGr.push(c);
            }
        }
    });
}

function addDeleteListenerForGroup() {
    $("#sideMultipleGroup tbody button#deleteGr").on("click", function () {
        //Unselect
        isMovingMultipleObject = false;
        currentSelectedGr = [];
        for (r of $(this).parent().parent().find("tr")) {
            $(r).children().eq(2).children().prop("checked", false);
        }
        //Delete
        let groupTD = $(this).parent().prev();
        let group = $(groupTD).text();
        $(groupTD).parent().remove();
        for(c of selectGr) {
            if(c.name == group) {
                for(e of c.elements) {
                    for(let ig = 0; ig < e.group.length; ig++) {
                        if(e.group[ig] == group) e.group.splice(ig, 1);
                    }
                }
            }
        }
        for (let spliceEl = 0; spliceEl < selectGr.length; spliceEl++) {
            if(group == selectGr[spliceEl].name)
                selectGr.splice(spliceEl, 1);
        }
    });
}

function addSelectedToAll(group) {
    for(c of selectGr) if(c.name == group) {addGroupToGivenGroup(group); return}
    for(c of currentSelectedGr) c.group.push(group);
    selectGr.push({"name":group, "elements":currentSelectedGr});
    isMovingMultipleObject = true;
    currentSelectedGr = [];
    for(c of selectGr) if(group == c.name) currentSelectedGr.push(c);
}

function addGroupToGivenGroup(group) {
    for(g of selectGr) if(g.name == group) for(c of currentSelectedGr) if(!g.elements.includes(c)) g.elements.push(c);
    for(c of currentSelectedGr) if(!c.group.includes(group)) c.group.push(group);
    isMovingMultipleObject = true;
    currentSelectedGr = [];
    for(c of selectGr) if(group == c.name) currentSelectedGr.push(c);
}

function createGroupNamer() {
    /*
    <div id="groupName">
        <label for="inputName">Entrer le nom du groupe :</label>
        <input type="text" id="inputName" />
        <button id="deleteField">Effacer</button>
        <label for="inputGroup">Ou ajouter a un groupe existant :</label>
        <select id="inputGroup">
            <option value="">--Choisir--</option>
            <option value="{idGroup}">{idGroup}</option>
        </select>
    </div>
    */

    let group = document.createElement('div');
    $(group).attr("id", "groupName");
    let label = document.createElement('label');
    $(label).attr("for", "inputName");
    $(label).text(getMsg("enter_groupname"));
    let input = document.createElement('input');
    $(input).attr("type", "text");
    $(input).attr("id", "inputName");
    $(group).append(label);
    $(group).append(input);

    let button = $(document.createElement("button")).on("click", function() {$("input[type=text]#inputName").val("")});
    $(button).attr("id", "deleteFieldGroup");
    $(button).text(getMsg("delete"));
    $(group).append(button);

    let labelS = document.createElement('label');
    $(labelS).attr("for", "inputGroup");
    $(labelS).text(getMsg("addto_existingfile"));

    let select = document.createElement('select');
    $(select).attr("id", "inputGroup");
    let option = document.createElement("option");
    $(option).attr("value", "");
    $(option).text("--" + getMsg("choose") + "--");
    $(select).append(option);
    for(g of selectGr) {
        option = document.createElement("option");
        $(option).attr("value", g.name);
        $(option).text(g.name);
        $(select).append(option);
    }
    $(group).append(labelS);
    $(group).append(select);
    $("body").append(group);
}

$(document).ready(function(e) {
  $(document).on("keyup", function(e) {
      if(!isSelectingMultipleObject) return
      if(e.which != 17) return
      if(currentSelectedGr.length == 0) return
      //Here, CTRL is realeased and there is at least 2 objects in the group
      isSelectingMultipleObject = false;
      createGroupNamer();
      $("#groupName").dialog({
        width: 500,
        maxHeight: 300,
        title: getMsg("create_group"),
        modal: true,
        close: function(e, ui) {
            $("#groupName").remove();
            currentSelectedGr = [];
        },
        buttons: {"Ok": function(t) {
            let group = $("#inputName").val();
            if(Boolean(group)) addSelectedToAll(group);
            else {
                group = $("#inputGroup").val();
                if(Boolean(group)) addGroupToGivenGroup(group);
            }
            if(Boolean(group)) $("#groupName").remove();
        }, "Cancel": function(t) {
            currentSelectedGr = [];
            $("#groupName").remove();
        }
        }
      });
  });

  /* Open dropdown menu on mouse hover. */
  $(".dropdown-toggle").mouseenter(function () {
    $(this).find(".dropdown-menu").show();
  }).mouseleave(function () {
    $(this).find(".dropdown-menu").hide();
  });
  /* Simulate click on parent radio when dropdown menu item clicked. */
  $(".dropdown-menu > div > label").click(function (e) {
    $(this).parent().parent().prev().click();
    $(this).parent().parent().hide();
    e.stopPropagation();
  });

  /* Initialize Bootstrap Popover */
  $("[data-toggle=popover]").popover();

  $("#toggleGroupPanel_button").on("click", function() {
      createGroupPanel();
      $("#sideMultipleGroup").dialog({
          width: 400,
          maxHeight: 300,
          title: getMsg("group_management"),
          modal: true,
          close: function(e, ui) {
              $("#sideMultipleGroup").remove();
          }
      });
  });
})

function addTool(name, message) {
    //1) Add input in index.html
    let optionsbar = $("#toolbar_title").parent();
    let input = document.createElement("input");
    $(input).attr("id", "tool_" + name);
    $(input).attr("type", "button");
    $(input).addClass("toolbtn");
    $(optionsbar).append(input);

    //2) Add name in tools_normal in index.js
    tools_normal.splice(tools_normal.length-1, 0, name);

    //3) Add idName and idName_popover and toolname_name in en.js
    locales["en"]["tool_" + name] = {};
    locales["en"]["tool_" + name].message = name.charAt(0).toUpperCase() + name.slice(1);

    locales["en"]["toolname_" + name] = {};
    locales["en"]["toolname_" + name].message = name.charAt(0).toUpperCase() + name.slice(1);

    locales["en"]["tool_" + name + "_popover"] = {};
    locales["en"]["tool_" + name + "_popover"].message = message;

    //4) Add new ToolBarItem in ToolBarViewModel.js
    window.toolBarViewModel.toolbarGroups[1].tools.push(
        new ToolBarItem(name.charAt(0).toUpperCase() + name.slice(1), "tool_" + name, name, ToolTypeEnum.RADIO)
    )

    //5) Add name given by locales in index.js
    document.getElementById("tool_" + name).value = getMsg("toolname_" + name);
    document.getElementById("tool_" + name).dataset['n'] = getMsg("toolname_" + name);
}