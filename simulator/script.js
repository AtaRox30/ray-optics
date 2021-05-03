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
  $(indice).text("Refractive index");
  let bright = document.createElement('td');
  $(bright).text("Brightness");
  $(trH).append(type); $(trH).append(indice); $(trH).append(bright)

  $(thead).append(trH);
  $(table).append(thead);

  let tbody = document.createElement('tbody');
  for(let i = 0; i < element[0].length; i++) {
      let tr = document.createElement('tr');
      for(let j = 0; j < 3; j++) {
          let td = document.createElement('td');
          if(j == 0) $(td).text(element[0][i].type);
          if(j == 1) $(td).text(element[0][i].p);
          if(j == 2) $(td).text(element[0][i].brightness);
          $(tr).append(td);
      }
      $(tbody).append(tr);
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
  console.log(selectGr);
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
          }
          $(td).append(el);
          $(tr).append(td);
      }
      $(tbody).append(tr);
  }
  $(table).append(tbody);
  $(div).append(table);
  $("body").append(div);

  //Delete button
  $("#sideMultipleGroup tbody button#deleteGr").on("click", function() {
      let groupTD = $(this).parent().prev();
      let group = $(groupTD).text();
      $(groupTD).parent().remove();
      for(let spliceEl = 0; spliceEl < selectGr.elements.length; spliceEl++) {
          if(group == selectGr.elements[spliceEl].name) element.splice(spliceEl, 1)
      }
  });

  //Select radio button
  $("#sideMultipleGroup tbody tr td:last-child").on("click", function() {$(this).children().prop("checked", true)});
  
  //Name button
  $("#sideMultipleGroup tbody tr td:first-child button").on("click", function() {
      let group = $(this).text();
      let currentElementArray = [];
      for(c of selectGr) {
          if(group == c.name) currentElementArray.push(c.elements);
      }
      console.log(selectGr);
      createModalProperties(currentElementArray);
      $("#elementInGr").dialog({
          title: group,
          modal: true,
          close: function(e, ui) {
              $("#elementInGr").remove();
          }
      });
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
    let object = {"name":group, "elements":currentSelectedGr};
    selectGr.push(object);
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
        buttons: {"Ok":function(t) {
            let groupName = $("#inputName").val();
            addCurrentGrToAllSelection(groupName);
            $("#groupName").remove();
        }, "Annuler": function(t) {
            $("#groupName").remove();
            currentSelectedGr = [];
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

  //Modal panel to group ungroup
  var element = [{"nom":"Jonquille", "elements":[{"type":"Halfplane", "refraction":"1.5"}, {"type":"Ray"}]}, 
    {"nom":"Rose", "elements":[{"type":"Circle", "refraction":"1.5"}, {"type":"Ray"}, {"type":"Halfplane", "refraction":"1.5"}]}, 
    {"nom":"Hibiscus", "elements":[{"type":"Freeshape", "refraction":"1.5"}, {"type":"Ray"}]},
    {"nom":"Tulipe", "elements":[{"type":"Beam", "brightness":"0.07"}, {"type":"Ray"}, {"type":"Circle", "refraction":"1.5"}]}, 
    {"nom":"Sakura", "elements":[{"type":"Halfplane", "refraction":"1.5"}, {"type":"Ray"}]}, 
    {"nom":"Petunia", "elements":[{"type":"Halfplane", "refraction":"1.5"}, {"type":"Ray"}, {"type":"Halfplane", "refraction":"1.5"}]},
    {"nom":"Cactus", "elements":[{"type":"Freeshape", "refraction":"1.5"}, {"type":"Beam", "brightness":"0.07"}]},
    {"nom":"Orchidée", "elements":[{"type":"Halfplane", "refraction":"1.5"}, {"type":"Ray"}]}, 
  ];

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