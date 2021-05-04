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
  $(type).text("Type");
  let indice = document.createElement('td');
  $(indice).text("Proprietés");
  $(trH).append(type); $(trH).append(indice);

  $(thead).append(trH);
  $(table).append(thead);

  let tbody = document.createElement('tbody');
  if(element[0] != undefined) {
    for(let i = 0; i < element[0].length; i++) {
        let tr = document.createElement('tr');
        for(let j = 0; j < 2; j++) {
            let td = document.createElement('td');
            if(j == 0) $(td).text(element[0][i].type);
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
      if(indexTR1 == 0) $(td1).text("Nom");
      if(indexTR1 == 1) $(td1).text("Supprimer");
      if(indexTR1 == 2) $(td1).text("Selectionner");
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
  $(ungroupButton).text("Deselectionner");
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
              $(el).text("Supprimer");
          }
          if(indexTD1 == 2) {
              el = document.createElement("input");
              $(el).attr("type", "radio");
              $(el).attr("name", "multipleGr");
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
        let groupTD = $(this).parent().prev();
        let group = $(groupTD).text();
        $(groupTD).parent().remove();
        for (let spliceEl = 0; spliceEl < selectGr.length; spliceEl++) {
            if (group == selectGr[spliceEl].name)
                selectGr.splice(spliceEl, 1);
        }
    });
}

function createGroupNamer() {
    /*
    <div id="groupName">
        <label for="inputName">Entrer le nom du groupe :</label>
        <input type="text" id="inputName" />
    </div>
    */

    let group = document.createElement('div');
    $(group).attr("id", "groupName");
    let label = document.createElement('label');
    $(label).attr("for", "inputName");
    $(label).text("Entrer le nom du groupe :");
    let input = document.createElement('input');
    $(input).attr("type", "text");
    $(input).attr("id", "inputName");
    $(group).append(label);
    $(group).append(input);
    $("body").append(group);
}

function addCurrentGrToAllSelection(group) {
    
}

$(document).ready(function(e) {
  $(document).on("keyup", function(e) {
      if(!isSelectingMultipleObject) return
      if(e.which != 17) return
      if(currentSelectedGr.length < 2) return
      //Here, CTRL is realeased and there is at least 2 objects in the group
      isSelectingMultipleObject = false;
      createGroupNamer();
      $("#groupName").dialog({
        width: 400,
        maxHeight: 300,
        title: "Nom du groupe",
        modal: true,
        close: function(e, ui) {
            $("#groupName").remove();
            currentSelectedGr = [];
        },
        buttons: {"Ok": function(t) {
            let group = $("#inputName").val();
            selectGr.push({"name":group, "elements":currentSelectedGr});
            $("#groupName").remove();
        }, "Annuler": function(t) {
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
          title: "Selection",
          modal: true,
          close: function(e, ui) {
              $("#sideMultipleGroup").remove();
          }
      });
  });
})