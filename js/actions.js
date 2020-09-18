var userData = getData();
var prompterAfter;
var iconAfter;
var currentPage = 0;
var homePageHTML =
`<img style="width:100%" src="img/todoka-title.svg"/>
<div class="middle">
  <button onclick="downloadApp()" style="position:relative;top:-40px">Download Application</button>
  <a href="start"><button style="position:relative;top:-40px">Todoka Start Page</button></a>
</div>
<br>
<img style="width:100%;border-radius:8px;border:2px solid #5b48e9" src="img/todoka-guide.gif"/>
<div class="start-here"><i>arrow_back</i><span>Start Here</span></div>
`

function getData() {
  if(localStorage.getItem('taskData') == null)setData({tasks: []});
  return JSON.parse(localStorage.getItem('taskData'));
}

function setData(data=userData){
  localStorage.setItem('taskData', JSON.stringify(data));
}

function updateSidebar(data = userData, selected=0) {

  var result = ''
  result += `
  <div onclick="page(-1)" ${selected == -1 ? 'selected' : ''}>
    <div class="left">
        <i>home</i>
        <span>Home</span>
    </div>
    <span class="right"></span>
  </div>`
  data.tasks.forEach((item, i) => {
    result += `
    <div onclick="page(${i})" ${selected == i ? 'selected' : ''}>
      <div class="left">
          <i>${item.icon}</i>
          <span>${item.name}</span>
      </div>
      <span class="right">${item.groups.reduce((a,b)=>a+b.tasks.length,0)}</span>
    </div>`
  });

  $('aside .list').innerHTML = result;
}

function page(number=currentPage){
  if(userData.tasks.length == 0){
    number = -1;
  }
  currentPage = number;
  if(window.innerWidth < 650){
    $('aside').style.display = 'none'
    $('main').style.display = 'block'
    $('.mobile-menu').style.display = 'block'
  }
  if(number == -1){
    if(userData.tasks.length > 0)
      createHomePage();
    else {
      $('main .center').innerHTML = homePageHTML
      if(!userData.tutorialEnd)
        $('.start-here').style.display = 'block';
    }
    updateSidebar(userData, number)
    return;
  }
  updateSidebar(userData, number)
  var task = userData.tasks[number]
  $('main .center').innerHTML = pageTemplate({
    title: task.name,
    groups: task.groups.map((i,c) => {return {
        groupName: i.name,
        groupColor: i.color,
        groupIcon: i.icon,
        groupNumber: c,
        groupInfo: i.tasks.length+' Tasks',
        groupTasks: i.tasks.map((b, e) => {return {
          taskName: b.name,
          taskInfo: generateInfo(b.time, b.effort),
          taskNumber: e,
          priority: b.priority ? '<b style="\
          color:#d44;position:relative;top:3px" class="uninvert">*</b>' : '',
          taskD1: b.date == 1 ? 'selected="true"' : '',
          taskD2: b.date == 2 ? 'selected="true"' : '',
          taskD3: b.date == 3 ? 'selected="true"' : '',
        }}),
      }})
  })
  setTheme()

  if(userData.tasks.length == 1 && number == 0 && !userData.tutorialEnd){
    if(!userData.tasks[0].groups.length)
      $('.start-here.second').style.display = 'block';
    else if(userData.tasks[0].groups[0].tasks.length == 0)
      $('.start-here.third').style.display = 'block';
    else {
      $('.start-here.fourth').style.display = 'block';
    }
  }
}

function createHomePage(){
  $('main .center').innerHTML = '<h1>Home</h1>'
  updateSidebar(userData, -1)

  if(userData.homeGroups == undefined){
    userData.homeGroups=[0,1,1,1,1,1,1,1,1]
    setData();
  }

  var conditions = [
    a=>a.date==1,
    a=>a.priority,
    a=>a.time==4,
    a=>a.time==5,
    a=>Number(a.effort)+Number(a.time)>=5&&a.time<=3,
    a=>Number(a.effort)+Number(a.time)<=3&&a.time<=3,
    a=>a.date==2,
    a=>a.date==3,
    a=>true,
  ]
  var results = []
  conditions.forEach((fun) => {
    var result = []
    userData.tasks.forEach((a,aa) => a.groups.forEach((b,bb) => b.tasks.forEach((c,cc) => {
      if(fun(c))result.push({
        taskName: c.name,
        taskInfo: generateInfo(c.time, c.effort),
        taskNumber: cc,
        priority: c.priority ? '<b style="\
        color:#d44;position:relative;top:3px" class="uninvert">*</b>' : '',
        taskD1: c.date == 1 ? 'selected="true"' : '',
        taskD2: c.date == 2 ? 'selected="true"' : '',
        taskD3: c.date == 3 ? 'selected="true"' : '',
        page: aa,
        groupNumber2: bb,
        taskIcon:b.icon,
        taskIconColor:b.color,
        pageName:a.name,
        groupName2: b.name,
        pageIcon:a.icon,
      });
    })));
    results.push(result);
  });
  if(results.filter(a=>a.length).length == 0){
    $('main .center').innerHTML = homePageHTML
    return;
  }

  var groups = [
      {
        groupName: 'Today',
        groupIcon: 'view_day',
        groupInfo: 'Current tasks to complete today',
        groupNumber: 0,
        groupTasks: results[0],
        minimizeGroup: userData.homeGroups[0] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[0] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'Priority Tasks',
        groupIcon: 'priority_high',
        groupInfo: 'The most urgent tasks',
        groupNumber: 1,
        groupTasks: results[1],
        minimizeGroup: userData.homeGroups[1] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[1] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'Events',
        groupIcon: 'calendar_today',
        groupInfo: 'Current events',
        groupNumber: 2,
        groupTasks: results[2],
        minimizeGroup: userData.homeGroups[2] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[2] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'Reminders',
        groupIcon: 'notifications',
        groupInfo: 'Things you need to be reminded of',
        groupNumber: 3,
        groupTasks: results[3],
        minimizeGroup: userData.homeGroups[3] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[3] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'Challanges',
        groupIcon: 'emoji_events',
        groupInfo: 'Complete the hardest tasks',
        groupNumber: 4,
        groupTasks: results[4],
        minimizeGroup: userData.homeGroups[4] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[4] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'Easy Tasks',
        groupIcon: 'thumb_up',
        groupInfo: 'Complete the easier tasks',
        groupNumber: 5,
        groupTasks: results[5],
        minimizeGroup: userData.homeGroups[5] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[5] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'This Week',
        groupIcon: 'view_week',
        groupInfo: 'Tasks this week',
        groupNumber: 6,
        groupTasks: results[6],
        minimizeGroup: userData.homeGroups[6] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[6] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'This Month',
        groupIcon: 'view_comfy',
        groupInfo: 'Tasks this month',
        groupNumber: 7,
        groupTasks: results[7],
        minimizeGroup: userData.homeGroups[7] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[7] ? 'expand_more' : 'expand_less',
      },
      {
        groupName: 'All Tasks',
        groupIcon: 'ballot',
        groupInfo: 'All of the tasks',
        groupNumber: 8,
        groupTasks: results[8],
        minimizeGroup: userData.homeGroups[8] ? ' minimize' : '',
        minimizeIcon: userData.homeGroups[8] ? 'expand_more' : 'expand_less',
      },
    ]
  groups = groups.filter(group => group.groupTasks.length)

  $('main .center').innerHTML = homeTemplate({
    groups: groups,
  })

  setTheme()

  if(!userData.tutorialEnd)$('.start-here.fifth').style.display="block";
}

function pageTemplate(arr){
  return repit(`
    <h1>{title}</h1>
    <button onclick="deleteContainer()">Remove category</button>
    <br>
    <br>
    {for groups}
    <div class="group">
      <div class="top">
        <i class="icon uninvert" style="color: {groupColor}">{groupIcon}
        </i>
        <span class="group-name">{groupName}</span>
        <span class="info">{groupInfo}</span>
        <i class="add" onclick="addTask('{groupNumber}')">add</i>
        <i class="add" style="margin-right:10px"
        onclick="deleteGroup('{groupNumber}')">delete</i>
      </div>
      <div class="tasks">
        {loop groupTasks}
        <div>
          <i class="checkbox"
          onclick="checkTheBox(event, '{groupNumber}', '{taskNumber}')">
          check_box_outline_blank</i>
          <span class="task-name">{priority=awe} {taskName}</span>
          <span class="info">{taskInfo}</span>
          <div class="right">
            <i onclick="editTask('{groupNumber}','{taskNumber}')"
            style="margin-right: 10px;">edit</i>
            <i onclick="changeTaskDate(event,1,'{groupNumber}','{taskNumber}')"
            {taskD1} title="Day">
            view_day</i>
            <i onclick="changeTaskDate(event,2,'{groupNumber}','{taskNumber}')"
            {taskD2} title="Week">
            view_week</i>
            <i onclick="changeTaskDate(event,3,'{groupNumber}','{taskNumber}')"
            {taskD3} title="Month">
            view_comfy</i>
          </div>
        </div>
        {/loop}
      </div>
    </div>
    {/for}
    <div onclick="addGroup()" class="group add">
    <i class="add">add</i>
    </div>
    <div class="start-here second"><i>arrow_upward</i><span>Create new group</span></div>
    <div class="start-here third"><span>Add new task</span><i>arrow_upward</i></div>
    <div class="start-here fourth"><i>arrow_back</i><span>See organized tasks</span></div>
    `, arr);
}

function homeTemplate(arr){
  return repit(`
    <h1>Home</h1>
    {for groups}
    <div class="group{minimizeGroup}">
      <div class="top">
        <i class="icon" style="color: {groupColor}">{groupIcon}
        </i>
        <span class="group-name">{groupName}</span>
        <span class="info">{groupInfo}</span>
        <i class="add" onclick="minimizeGroup(event,{groupNumber})">{minimizeIcon}</i>
      </div>
      <div class="tasks">
        {loop groupTasks}
        <div>
          <i class="checkbox"
          onclick="checkTheBox(event, '{groupNumber2}', '{taskNumber}', '{page}')">
          check_box_outline_blank</i>
          <i style="opacity:0.5" onclick="page('{page}')">{pageIcon}</i>
          <i class="uninvert" style="opacity:0.5;color:{taskIconColor}" onclick="page('{page}')">{taskIcon}</i>
          <span class="task-name">{priority} {taskName}</span>
          <span class="info">{pageName} - {groupName2}</span>
          <div class="right">
            <i onclick="editTask('{groupNumber2}','{taskNumber}','{page}')"
            style="margin-right: 10px;">edit</i>
            <i onclick="changeTaskDate(event,1,'{groupNumber2}',
            '{taskNumber}',{page})"{taskD1} title="Day">
            view_day</i>
            <i onclick="changeTaskDate(event,2,'{groupNumber2}',
            '{taskNumber}',{page})"{taskD2} title="Week">view_week</i>
            <i onclick="changeTaskDate(event,3,'{groupNumber2}',
            '{taskNumber}',{page})"{taskD3} title="Month">view_comfy</i>
          </div>
        </div>
        {/loop}
      </div>
    </div>
    {/for}
    <div class="start-here fifth"><i>arrow_back</i><span>View settings</span></div>

  `, arr);
}

function generateInfo(time, effort){
  var result = ''
  if(time == 1)result += 'Few work '
  else if(time == 2)result += 'A bit of work '
  else if(time == 3)result += 'Lots of work '
  else if(time == 4){result += 'Event';return result}
  else if(time == 5){result += 'Reminder';return result}
  if(effort == 1)result += 'but its easy'
  else if(effort == 2)result += 'and some effort'
  else result += 'and its hard'
  return result
}

function prompter(a, func){

  var result = ''
  function tager(text, c){
    return (c.match(RegExp(`^${text}[0-9]?[0-9]?$`))||{}).input;
  }
  for(var i in a){
    if(typeof a[i] == 'string')
    switch(i){
      case 'h1': result += `<h1>${a[i]}</h1>`; break;
      case tager('h2',i): result += `<h2>${a[i]}</h2>`; break;
      case tager('p',i): result += `<p>${a[i]}</p>`; break;
      case 'color': result += generateColorPicker(); break;
      case tager('html',i): result += a[i]; break;
      case tager('fileInput',i): result += `<input type="file" name="${a[i]}">`;break;
      case 'selectIcon': result += `<br><br>
      <button onclick="iconPopup(updateFormIconText)" style="padding: 3px 6px;margin-bottom:0">Select Icon</button>
      <br><input style="width:200px" type="text" placeholder="${a[i]}"
      onkeyup="updateFormIcon(event)" class="formitem-icon"><i id="formIconSample"
      onclick="iconPopup(updateFormIconText)">search</i><br>`; break;
      default: result += `<input type="text" placeholder="${a.setDefaultValues ? i : a[i]}"
       class="formitem-${i}" ${a.setDefaultValues ? `value="${a[i]}"` : ''}>`; break;
    }
    else {
      if(a[i].type == "radio"){
        result += `<br><br><h2>${a[i].label}</h2>`
        a[i].options.forEach((item) => {
          if(item.text != '')
          result += `<br><label name="${i}" class="radio">${item.text}
            <input type="radio" ${item.default ? 'checked' : ''} value="${item.value}" name="${i}">
            <span class="checkmark"></span>
          </label>`
        });
      }
      else if(a[i].type == "checkbox"){
        result += `<br>`
        if(a[i].label)
        result += `<br><label name="${i}" class="checkbox">${a[i].label}
          <input type="checkbox" ${a[i].default ? 'checked' : ''} name="${i}">
          <span class="checkmark"></span>
        </label>`
      }
    }
  }
  result+='<br><input onclick="prompterBefore(event)" class="button" type="submit" value="Submit">'
  result+='<input style="opacity: 0.7; float: right" class="button" onclick="closePopup()" type="submit" value="Cancel">'
  prompterAfter = func
  $('.popup .center').innerHTML = result;
  $('.popup').style.display = 'flex'
  setTheme();
}

function generateColorPicker() {
  var result = '<div class="color-outer uninvert">'
  var colors = ['#d44', '#d84', '#dd4', '#4d4', '#4dd', '#44d', '#84d', '']
  colors.forEach(color => {
    result += `<br><label name="color" class="radio">
      <input type="radio" checked value="${color}" name="color">
      <span class="checkmark" style="background:${color}"></span>
    </label>`
  })
  result += '</div>'
  return result;
}

function prompterBefore(e) {
  var result = {};
  [...e.target.parentElement.childNodes].map((child) => {
    var match = child.className && child.className.match(/^formitem-(.+)/)
    if(match){
      if(child.type == 'text'){
        result[match[1]] = child.value;
      }
    }
    else if(child.className == "radio" && child.children[0].checked){
      result[child.getAttribute('name')] = child.children[0].value
    }
    else if(child.className == "checkbox"){
      result[child.getAttribute('name')] = child.children[0].checked
    }
    else if(child.type == "file"){
      result[child.getAttribute('name')] = child
    }
    else if(child.className == 'color-outer uninvert'){
      child.childNodes.forEach((label) => {
        if(label.children.length && label.children[0].checked)
          result.color = label.children[0].value;
      });
    }
  })

  prompterAfter(result);
  closePopup();
}

function updateFormIcon(){
  $('#formIconSample').innerText = $('.formitem-icon').value;
}

function updateFormIconText(icon){
  $('.formitem-icon').value = icon
  updateFormIcon()
}

function closePopup(e){
  if(e == undefined){
    $('.popup').style.display = 'none';
  }
  else if(e == 2){
    $('.popup2').style.display = 'none';
  }
  else if(e.target.className == 'popup' || e.target.className == 'popup2')event.target.style.display = 'none';
}

function addContainer(){
  prompter({
    h1: "Create new category",
    name: "category Name",
    p: "ex. School, Work, Projects",
    selectIcon: "Icon"
  }, (result) => {
    userData.tasks = [...userData.tasks, {
      name: result.name,
      icon: result.icon,
      groups: [],
    }]
    updateSidebar();
    page(userData.tasks.length-1);
    setData();
  })
}

function addGroup(container=currentPage){
  prompter({
    h1: "Add Group",
    name: "Group Name",
    p: "ex. Math class, Emails, My project",
    selectIcon: "Icon",
    color: "color (optional)",
  }, (result) => {
    userData.tasks[currentPage].groups = [...userData.tasks[currentPage].groups, {
      name: result.name,
      icon: result.icon,
      color: result.color,
      tasks: [],
    }]
    page(currentPage);
    setData();
  })
}

function deleteContainer(container=currentPage){
  prompter({
    h2: 'Are you sure you want to delete '+userData.tasks[currentPage].name+" category",
  }, (result) => {
    userData.tasks.splice(currentPage, 1);
    updateSidebar();
    page(0);
    setData();
  })
}

function addTask(group, container=currentPage){
  prompter({
    h1: "New Task",
    name: "Task Name",
    priority: {
      label: "Priority Task",
      type: "checkbox",
    },
    dewdate: {
      label: "When should this be done?",
      type: "radio",
      options: [
        {text:"Today",value:"1",default:true},
        {text:"This Week",value:"2"},
        {text:"This Month",value:"3"},
      ]
    },
    time: {
      label: "How long will this task take?",
      type: "radio",
      options: [
        {text:"Less than half an hour",value:"1",default:true},
        {text:"Half an hour to an hour",value:"2"},
        {text:"More than a couple hours",value:"3"},
        {text:"All day event",value:"4"},
        //{text:"This is a reminder",value:"5"},
      ]
    },
    effort: {
      label: "How difficult is this task",
      type: "radio",
      options: [
        {text:"Easy",value:"1",default:true},
        {text:"Moderate",value:"2"},
        {text:"Difficult",value:"3"},
      ]
    },
  },(result) => {
    userData.tasks[currentPage].groups[group].tasks.push({
      name: result.name,
      date: result.dewdate,
      time: result.time,
      effort: result.effort,
      priority: result.priority,
    })
    page(currentPage);
    setData();
  })

}

function editTask(group, task, container=currentPage){
  var taskData = userData.tasks[container].groups[group].tasks[task];
  prompter({
    setDefaultValues: true,
    h1: "Edit Task",
    name: taskData.name,
    priority: {
      label: "Priority Task",
      type: "checkbox",
      default: taskData.priority,
    },
    dewdate: {
      label: "When should this be done?",
      type: "radio",
      options: [
        {text:"Today",value:"1",default:taskData.date==1},
        {text:"This Week",value:"2",default:taskData.date==2},
        {text:"This Month",value:"3",default:taskData.date==3},
      ]
    },
    time: {
      label: "How long will this task take?",
      type: "radio",
      options: [
        {text:"Less than half an hour",value:"1",default:taskData.time==1},
        {text:"Half an hour to an hour",value:"2",default:taskData.time==2},
        {text:"Mor than a couple hours",value:"3",default:taskData.time==3},
        {text:"All day event",value:"4",default:taskData.time==4},
      ]
    },
    effort: {
      label: "How difficult is this task?",
      type: "radio",
      options: [
        {text:"Easy",value:"1",default:taskData.effort==1},
        {text:"Moderate",value:"2",default:taskData.effort==1},
        {text:"Difficult",value:"3",default:taskData.effort==1},
      ]
    },
  },(result) => {
    userData.tasks[container].groups[group].tasks[task] = {
      name: result.name,
      date: result.dewdate,
      time: result.time,
      effort: result.effort,
      priority: result.priority,
    }
    page();
    setData();
  })
}

function checkTheBox(event, group, task, container=currentPage){
  if(event.target.innerText == 'check_box_outline_blank'){
    event.target.innerText = 'check_box'
    event.target.parentElement.style.transform = 'scaleY(0)';
    event.target.parentElement.style.margin = '-15px 0';

    userData.tasks[container].groups[group].tasks.splice(task, 1);
    setData();
    setInterval(() => {
      event.target.parentElement.outerHTML = '';
      if(currentPage == -1)page();
    }, 1000)



  }
  else if(event.target.innerText == 'check_box'){
    event.target.innerText = 'check_box_outline_blank'
  }
}

function changeTaskDate(e, date, group, task, container=currentPage){
  e.target.parentElement.childNodes.forEach(c => {
    if(c.setAttribute)c.setAttribute('selected', false)
  })
  e.target.setAttribute('selected', true);
  userData.tasks[container].groups[group].tasks[task].date = date;
  setData();
  if(currentPage == -1)page();
}

function backupData(){
  download('todoka-backup.json', JSON.stringify(userData))

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

function restoreData(input, func){
  var reader = new FileReader();
  reader.onload = function(){
    var text = reader.result;
    func(text)
  };
  if(input.files[0])
  reader.readAsText(input.files[0]);
}

function minimizeGroup(e, group){
  if(e.target.innerText == 'expand_less'){
    e.target.parentElement.parentElement.classList.add('minimize');
    e.target.innerText = 'expand_more'
    userData.homeGroups[group] = 1;
  }
  else{
    e.target.parentElement.parentElement.classList.remove('minimize');
    e.target.innerText = 'expand_less'
    userData.homeGroups[group] = 0;
  }
  setData();
}

function deleteGroup(group, container=currentPage){
  var groupObj = userData.tasks[container].groups[group]
  prompter({
    h2: 'Are you sure you want to remove group '+groupObj.name,
  }, () => {
    userData.tasks[container].groups.splice(group, 1);
    page();
    setData();
  })
}

function openOptions(){
  var themeOption = userData.theme ? userData.theme.charAt(0) : 1
  prompter({
    setDefaultValues: true,
    h1: 'Options',
    h22: 'Export Data',
    html: '<br><button onclick="backupData()">Export</button>',
    h23: 'Import Data',
    fileInput: 'restoreFile',
    h24: 'Clear all Data',
    html3: '<br><button onclick="clearData()">Clear data</button>',
    html2: '<br><br><button onclick="downloadApp()">Download app to computer</button>',
    filter: {
      label: "Select a filter theme",
      type: "radio",
      options: [
        {text:"Default",value:"1none",default:themeOption == 1},
        {text:"Darker",value:"2contrast(140%) grayscale(60.1%)",default:themeOption == 2},
        {text:"White",value:"3invert(100%) hue-rotate(170deg) sepia(20%) contrast(120%)",default:themeOption == 3},
        {text:"Green",value:"4hue-rotate(183deg) sepia(50%)",default:themeOption == 4},
        {text:"Orange",value:"5hue-rotate(123deg) sepia(50%)",default:themeOption == 5},
        {text:"Neutral",value:"6hue-rotate(149deg) sepia(89%) grayscale(40%)",default:themeOption == 6},
      ]
    },
  }, (result) => {
    userData.name = result.name;
    restoreData(result.restoreFile, (result) => {
      prompter({
        h1: 'Are you sure?',
        p: 'Are you sure you want to import this data as this will overide \
        existing data with the new data. You should backup Your data just in case',
        html: '<button onclick="backupData()">Backup Data</button>',
      }, () => {
        userData = JSON.parse(result);
        setData();
        window.location.reload(false);
      })
    })
    setTheme(result.filter);
    setData();
    if(!userData.tutorialEnd){
      console.log('tutorialEnd');
      userData.tutorialEnd = true;
      page();
      setTimeout(()=>{
        prompter({
          h1: 'Do you want to download Todoka application?',
        }, () => {
          downloadApp();
        })
      }, 10)
    }
  })
  setData();
}

function clearData(){
  prompter({
    h1: 'Are you sure you want to clear all your data?',
    html: '<br><button onclick="backupData()">Backup your data</button><br>',
    p: 'This will remove all of your data. backup data?',
  }, () => {
    localStorage.clear();
    window.location.reload(false);
  })
}

function downloadApp(){
  popup(`
    <h1>Install Todoka Application</h1>
    <p>You will need a chrome, edge, or any chromeium browser for this</p>
    <ol>
      <li>Download the app from <a href="img/todoka.zip" download>this link</a></li>
      <li>Unzip the zip file you just downloaded to get the .crx file</li>
      <li>Navigate to the url chrome:extentions in the chrome browser</li>
      <li>Turn on the developer mode on the top right</li>
      <li>Drag and drop the todoka.crx file onto the page</li>
    </ol>
    <br>
    <img class="uninvert" src="img/appi1.png" style="width:100%">
  `)
  setTheme();
}

function setTheme(filter=userData.theme){
  if(!userData.theme){
    userData.theme = '1none';
    setData();
    return;
  }
  $('body').style.filter = filter.substr(1);
  userData.theme = filter;
  var hueRotation = filter.match(/hue-rotate\((.+?)deg\)/)
  hueRotation = hueRotation ? 360-hueRotation[1] : 0
  var invert = filter.match(/invert\((.+?)%\)/)
  invert = invert ? invert[1] : 0
  $$('.uninvert').styles({
    filter: `hue-rotate(${hueRotation}deg) invert(${invert}%)`
  })
  $$('.justuninvert').styles({
    filter: `invert(${invert}%)`
  })
  $$('.uninvert').forEach(el => {
    if(el.style.color == '' && invert > 50)el.style.color = '#557';
    else if(el.style.color == 'rgb(221, 221, 68)' && invert > 50)
      el.style.color = '#b0a114'
  })
  if(invert > 50){
    $('aside').style.boxShadow = '2px 0 0 #446';
    $$('.group').styles({
      borderColor: '#557',
      backgroundColor: '#224',
    });
  }else{
    $('aside').style.boxShadow = '';
    $$('.group').styles({
      borderColor: '',
      backgroundColor: '',
    });
  }
  setData();
}

function openSidebar(){
  $('aside').style.display = 'block';
  if(window.innerWidth < 650)
  $('main').style.display = 'none';
  $('.mobile-menu').style.display = 'none';
}

function popup(html=''){
  $('.popup2 .box .center').innerHTML = html
  $('.popup2').style.display = 'flex'
}

function iconPopup(func){
  iconAfter = func
  popup(icons.reduce((a,c) => {
    return a+`<i title="${c}" onclick="selectIcon('${c}')">${c}</i>`
  }, '<input type="text" placeholder="Search" onkeyup="iconPopupSearch(this.value)"><br>\
  <a href="https://material.io/icons" target="_blank">Material Icons</a><div class="iconlist">'))
}

function iconPopupSearch(search){
  $('.iconlist').innerHTML = (() => {
    var filter = icons.filter(i => {
      if(typeof i == 'string')return i.includes(search)
    })
    return filter.reduce((a,c) => {
      return a+`<i title="${c}" onclick="selectIcon('${c}')">${c}</i>`
    }, '')
  })()
}

function selectIcon(icon){
  iconAfter(icon);
  closePopup(2);
}
