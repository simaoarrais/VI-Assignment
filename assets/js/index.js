// Inititalize all variables
const file_path = "assets/data/videos-stats.csv";
var videos_file_entry = new Array();
var videos_title = new Array();
var videos_id = new Array();
var videos_published = new Array();
var videos_keyword = new Array();
var videos_keyword_unique = [...new Set(videos_keyword)];
var videos_likes = new Array();
var videos_comments = new Array();
var videos_views = new Array();

let mapCategories_Views = new Map();
let mapCategories_Likes = new Map();
let mapCategories_Comments = new Map();


// Iterate through the CSV file and save data
async function parseData(file) {
  await d3.csv(file, function (data) {
    videos_file_entry.push(data[""]);
    videos_title.push(data["Title"]);
    videos_id.push(data["Video ID"]);
    videos_published.push(data["Published At"]);
    videos_keyword.push(data["Keyword"]);
    videos_likes.push(data["Likes"]);
    videos_comments.push(data["Comments"]);
    videos_views.push(data["Views"]);
    videos_keyword_unique = [...new Set(videos_keyword)];

    if (mapCategories_Views.has(data["Keyword"])) {
      mapCategories_Views.set(
        data["Keyword"],
        mapCategories_Views.get(data["Keyword"]) + parseInt(data["Views"])
      );
    } else {
      mapCategories_Views.set(data["Keyword"], parseInt(data["Views"]));
    }

    if (mapCategories_Likes.has(data["Keyword"])) {
      mapCategories_Likes.set(
        data["Keyword"],
        mapCategories_Likes.get(data["Keyword"]) + parseInt(data["Likes"])
      );
    } else {
      mapCategories_Likes.set(data["Keyword"], parseInt(data["Likes"]));
    }

    if (mapCategories_Comments.has(data["Keyword"])) {
      mapCategories_Comments.set(
        data["Keyword"],
        mapCategories_Comments.get(data["Keyword"]) + parseInt(data["Comments"])
      );
    } else {
      mapCategories_Comments.set(data["Keyword"], parseInt(data["Comments"]));
    }
  });
}

// Build Top Videos Tab
async function createTops() {
  var pie_chart_dict = {};

  /* ----------------- Clone the video views array and sort it ---------------- */
  var sorted_views = videos_views.map(function (e) {
    return e;
  });
  sorted_views.sort(function (a, b) {
    return a - b;
  });

  /* --------------------- Create Table and add data to it -------------------- */
  var tops_table = document.getElementById("tops-table-body");
  for (var i = 1; i <= 10; i++) {
    // Create Table Rows and Headers
    var table_row = tops_table.insertRow();
    var table_header = document.createElement("th");

    table_header.scope = "row";
    table_header.innerText = i;
    table_row.appendChild(table_header);

    /* ------------------------ Get index of sorted video ----------------------- */
    var video_index = videos_views.indexOf(sorted_views.at(-i));

    /* --------------------------- Create Table Cells --------------------------- */
    addCellToTable(table_row, videos_title[video_index]); // Title
    addCellToTable(table_row, videos_keyword[video_index]); // Category
    addCellToTable(table_row, Math.trunc(videos_views[video_index])); // Views
    addCellToTable(table_row, Math.trunc(videos_likes[video_index])); // Likes
    addCellToTable(table_row, Math.trunc(videos_comments[video_index])); // Comments
    addCellToTable(table_row, videos_published[video_index]); // Date

   

    /* -------------------- Get keywords and counter of tops -------------------- */
    keyword = videos_keyword[video_index];
    if (keyword in pie_chart_dict) {
      pie_chart_dict[keyword] += 1;
    } else {
      pie_chart_dict[keyword] = 1;
    }
  }

  /* --------------------------- Draw the pie chart --------------------------- */
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(function () {
    drawPieChart(pie_chart_dict);
  });
}

function addCellToTable(table_row, info) {
  var table_cell = document.createElement("td");
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}

function redirectingFromTableToYoutube() {
  var table = document.getElementById("tops-table-body");
  var rows = table.getElementsByTagName("tr");

 
  for (i = 0; i < rows.length; i++) {

    var currentRow = table.rows[i];

    var createOverHandler = function (row) {
      return function () {
        row.style.color = "#FF2F5F";   };
    };

    var createOutHandler = function (row) {
      return function () {
        row.style.color = 'black';   };
    };


    var createClickHandler = function(row) {
      return function() {
        var cell = row.getElementsByTagName("td")[0];
        var video_title = cell.innerHTML;
        video_id = videos_id[videos_title.indexOf(video_title)];
        window.open('https://www.youtube.com/watch?v=' + video_id);
      };
    };

    currentRow.onclick = createClickHandler(currentRow);
    currentRow.onmouseover = createOverHandler(currentRow);
    currentRow.onmouseout = createOutHandler(currentRow);

  }
  
}

///////////// BAR CHART  all categories //////////////
function barPlotAllCategories(data){
  const div = document.getElementById('divAllCategories');
  if (div.childNodes.length !== 0) {
    div.removeChild(div.childNodes[0]);
  }

  if (data == "views") {
    data =  dataViews.filter (function (d) {  return d.value > 90000000});
    
  } else if (data == "likes") {
    data =  dataLikes.filter (function (d) {  return d.value > 2905600; })
  }

  const tooltip = d3.select("body")
  .append("div")
  .attr("class","d3-tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("padding", "15px")
  .style("background", "rgba(0,0,0,0.6)")
  .style("border-radius", "5px")
  .style("color", "#fff")
  .text("a simple tooltip");

  // set the dimensions and margins of the graph
  const margin = {top: 30, right: 30, bottom: 70, left: 80},
      width = 1280 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#divAllCategories")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
        .on("mouseover", function(d, i) {
          tooltip.html(` ${d.target.__data__.value}`).style("visibility", "visible");
          d3.select(this)
            .attr("fill", "#0047aa");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", bar_color);
        });


  // Initialize the X axis
  const x = d3.scaleBand()
    .range([ 0, width ])
    .padding(0.2);
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)

  // Initialize the Y axis
  const y = d3.scaleLinear()
    .range([ height, 0]);
  const yAxis = svg.append("g")
    .attr("class", "myYaxis")


  // A function that create / update the plot for a given variable:

    // Update the X axis
    x.domain(data.map(d => d.name))
    xAxis.call(d3.axisBottom(x))

    // Update the Y axis
    y.domain([0, d3.max(data, d => d.value) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Create the u variable
    var u = svg.selectAll("rect")
      .data(data)

    u
      .join("rect") // Add a new rect for each new elements
      .transition()
      .duration(1000)
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#0B5ED7")


  
}

// Initialize the plot with the first dataset

// Build the Bar Chart
function barPlotCategories() {

  const tooltip = d3.select("body")
  .append("div")
  .attr("class","d3-tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("padding", "15px")
  .style("background", "rgba(0,0,0,0.6)")
  .style("border-radius", "5px")
  .style("color", "#fff")
  .text("a simple tooltip");

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 60, bottom: 70, left: 70 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#barPlotCategories")
    .append("svg")
    .attr("id", "barPlotCategoriesSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .on("mouseover", function(d, i) {
      tooltip.html(` ${d.target.__data__.name}`).style("visibility", "visible");

    })
    .on("mousemove", function(){
      tooltip
        .style("top", (event.pageY-10)+"px")
        .style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function() {
      tooltip.html(``).style("visibility", "hidden");
    });

  var selectedCategory = document.getElementById("mySelect").value;

  data_views = mapCategories_Views.get(selectedCategory);
  data_likes = mapCategories_Likes.get(selectedCategory);

  var data = [["Views", data_views],["Likes", data_likes],];

  max_value = Math.max(data_views, data_likes);

  // sort data
  data.sort(function (b, a) {
    return a.Value - b.Value;
  });

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map((d) => d[0]))
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, max_value + 1000])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[1]))
    .attr("fill", "#01A5EE");
}

function drawPieChart(pie_chart_dict) {
  /* ------------------------- Create the data table. ------------------------- */
  var data = new google.visualization.DataTable();

  /* ----------------------- Add first and second column ---------------------- */
  data.addColumn("string", "Keyword");
  data.addColumn("number", "Category of Videos");

  data.addRows([
    ["Tech", 79],
    ["Music", 112],
    ["Apple", 68],
    ["History", 83],
  ]);

  /* --------------------- Set chart configuration options -------------------- */
  var options = {
    title: "Category Pie Chart",
    is3D: false,
  };

  /* ------------------- Instantiate and draw the pie chart ------------------- */
  var chart = new google.visualization.PieChart(
    document.getElementById("pie-chart-row")
  );
  debugger;
  chart.draw(data, options);
}

// Adding categories to the dropdown menu
function addOptionsDropdown(options) {

  
  var myDiv = document.getElementById("divCategories");

  //Create array of options to be added
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.setAttribute("id", "mySelect");
  selectList.classList.add("form-select");

  myDiv.appendChild(selectList);

  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.setAttribute("value", options[i]);
    option.text = options[i];
    selectList.appendChild(option);
  }

  var categories_list = document.getElementById("mySelect");

  categories_list.addEventListener("click", function () {
    d3.select("#barPlotCategoriesSVG").remove();
    barPlotCategories();
  });
}


function wordCloud() {
  myWords = getWordCount(videos_keyword);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1300 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  var layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
      myWords.map(function (d) {
        return { text: d.word, size: d.size };
      })
    )
    
    .padding(5) //space between words
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d) {
      return d.size;
    }) // font size of words
    .on("end", draw);
  layout.start();

  // This function takes the output of 'layout' above and draw the words
  // Wordcloud features that are THE SAME from one word to the other can be here
  function draw(words) {
    svg
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", function (d) {return d.size;})
      .style("fill", "#01A5EE")
      .attr("text-anchor", "middle")
      .style("font-family", "trebuchet MS")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";})
      .text(function(d) { return d.text; })
      .on("click", function (d){
        chosen_category = d["target"]["__data__"]["text"];
        changeOption(chosen_category);

    })
      .text(function (d) {
        return d.text;
      });
      
  }

}

function changeOption(option){
  var select = document.getElementById("mySelect");
  select.value = option;
  d3.select("#barPlotCategoriesSVG").remove();
  barPlotCategories();

}


// ################################# DATA PROCESSING #################################

function preparingData() { // Preparing data for the bar plot
  //Removing irrelevant data
  
  dataViews = Array.from(mapCategories_Views, ([name, value]) => ({
    name,
    value,
  }));
  dataLikes = Array.from(mapCategories_Likes, ([name, value]) => ({
    name,
    value,
  }));
  return [dataViews, dataLikes];
}
// Getting word count of categories
function getWordCount(words) {
  let map = new Map();
  for (let i = 0; i < words.length; i++) {
    let item = words[i];
    if (map.has(item)) {
      map.set(item, map.get(item) + 1);
    } else {
      map.set(item, 1);
    }
  }
  res = Array.from(map, ([name, value]) => ({ word: name, size: value }));
  return res;
}



// Init
async function init() {
  await parseData(file_path);
  createTops();
  preparingData();
  addOptionsDropdown(videos_keyword_unique);
  barPlotCategories();
  wordCloud();
  redirectingFromTableToYoutube();
  barPlotAllCategories("views");
  addCellToTable(); //problemas com esta funcao

}

init();
