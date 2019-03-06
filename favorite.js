'use strict'

let collection = document.querySelector('.collection')
let loading = document.querySelector('.loading')
let modelBody = document.getElementById('bodyModalLabel')
let nav = document.querySelector('.nav')
let pagination = document.getElementById('pagination')
let searchInput = document.getElementById('searchInput')
let folderIcon = document.getElementById('folder-icon')
let favoriteText = document.getElementById('favorite-text')



const originDataArray = []
const INDEX_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users'
const ITEM_PER_PAGE = 10
const InitPage = 1
let peopleItem = ''
let currentData = []
let currentTotalPage = 0
let currentPage = 1
let currentNav = 'origin'


//先把user資料抓回來

originDataArray.origin = JSON.parse(localStorage.getItem('favoritePerson')) || []
currentData = JSON.parse(localStorage.getItem('favoritePerson')) || []
sortData(currentData)
updateContent(currentData)
loading.classList.remove('d-block')



//渲染user卡片
function renderCollection(dataArray) {

  collection.innerHTML = dataArray.map(item => (
    `
     <div class="people_item m-2" draggable="true" data-id="${item.id}" data-toggle="modal" data-target="#personModal">
          <div class="card border-info size">
              <div class="people-fit-text text-center">
                <div class="card-header">${item.name + ' ' + item.surname}</div>
              </div>
              <div class="card-body text-info">
                  <img src="${item.avatar}" alt="" draggable="false">
              </div>
          </div>
      </div>
    `
  )).join('')

  const peopleFitText = []
  peopleFitText.push(...document.querySelectorAll('.people-fit-text'))
  peopleFitText.forEach(item => reSize(item, item.children[0]))
  drag()

}


//調整card-header高度及裡面的字大小
function reSize(parent, child) {
  while (getSize(child, 'width') > getSize(parent, 'width')) {
    //調整card-header裡面的字大小
    let childFontSize = parseInt(getSize(child, 'font-size'))
    child.style.fontSize = childFontSize - 0.5 + 'px'

    //如果是人卡的才調整card-header高度
    if (parent.classList.contains('people-fit-text')) {
      let carPeopleItem = parent.closest(".people_item")
      let siblings = [carPeopleItem.previousElementSibling, carPeopleItem.nextElementSibling]
      let siblingSize = Math.max(...siblings.map(item => item ? item.querySelector('.card-header').offsetHeight : 0))
      carPeopleItem.querySelector('.card-header').style.height = siblingSize + 'px'
    }
  }

}

//取得指定屬性的size
function getSize(target, property) {
  return parseInt(window.getComputedStyle(target, null).getPropertyValue(property))
}


//監聽人物卡片
collection.addEventListener('click', e => {
  let peopleItemData = e.target.closest(".people_item")
  if (peopleItemData) {
    modelBody.innerHTML = ''
    const showUrl = INDEX_URL + '/' + peopleItemData.dataset.id
    modelBody.classList.add('vh-75')
    modelBody.innerHTML = `
    <div class="loading d-inline-block justify-content-center align-items-center">
        <div class="spinner-border text-info align-self-center" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
  `
    axios.get(showUrl).then(response => {
      const data = response.data
      renderDetailInfo(data)
    }).catch(error => console.log(error))
  }
})


//渲染卡片明細
function renderDetailInfo(data) {
  modelBody.innerHTML = `
  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
  </button>
  <div class="card card-box">
    <img class="card-img-top" src="${data.avatar}" alt="${data.name}">
    <div class="card-body">
      <div class="fit-text text-center">
        <h5 class="card-title">${data.name + ' ' + data.surname}</h2>
      </div>
      <p class="card-text text-center">
        ${data.region}&nbsp;&nbsp;  
        <i class="fa ${data.gender === 'female' ? 'fa-venus' : 'fa-mars'}" aria-hidden="true"></i> 
        ${data.age}
      </p>
      
      <div class="fit-text text-center social-icons">
         <a href="mailto:${data.email}" class="card-text"><i class="fa fa-envelope-o" aria-hidden="true"></i></a>
         <a href="#" class="card-text"><i class="fa fa-facebook" aria-hidden="true"></i></a>
         <a href="#" class="card-text"><i class="fa fa-instagram" aria-hidden="true"></i></a>
         <a href="#" class="card-text"><i class="fa fa-linkedin-square" aria-hidden="true"></i></a>
         <a href="#" class="card-text"><i class="fa fa-twitter" aria-hidden="true"></i></a>
      </div>
    </div>
  </div>
  `
  modelBody.classList.remove('vh-75')
  const fitText = []
  fitText.push(...document.querySelectorAll('.fit-text'))
  fitText.forEach(item => reSize(item, item.children[0]))

}

//監控nav
nav.addEventListener('click', e => {
  if (e.target.nodeName === 'A') {
    currentNav = e.target.textContent.replace(/[0-9]/g, '').toLowerCase().trim()
    if (currentNav === 'female') {
      currentData = originDataArray.female
    } else if (currentNav === 'male') {
      currentData = originDataArray.male
    } else {
      currentNav = 'origin'
      currentData = originDataArray.origin
    }
    currentPage = InitPage
    updateContent(currentData)
    searchInput.value = ''
    setActiveCss(e.target, 'nav')
  }
})


//渲染nav筆數
function renderNavItem(searchLenght) {
  const peopleCount = document.querySelectorAll('.people-count')
  peopleCount.forEach(item => {
    if (currentNav === 'female') {
      item.textContent = searchLenght
    } else if (currentNav === 'male') {
      item.textContent = searchLenght
    } else {
      item.textContent = searchLenght
    }

  })
}


//把資料分類成女/男
function sortData(data) {
  let girlData = []
  let boyData = []
  data.forEach(value => value.gender === 'female' ? girlData.push(value) : boyData.push(value))
  originDataArray.female = girlData
  originDataArray.male = boyData

  currentData = originDataArray[currentNav]
  updateContent(currentData)

}


//點social-media取消a站內連結
modelBody.addEventListener('click', e => { if (e.target.nodeName === 'I') e.preventDefault() })

//渲染頁面按鈕
function renderPages(data) {
  let pages = Math.ceil(data.length / ITEM_PER_PAGE) || InitPage
  currentTotalPage = pages
  let paginationContent = ''
  for (let i = 0; i < pages; i++) {
    paginationContent += `
     <li><a href="javascript:;" data-page="${i + 1}" class="pages ${i === 0 ? 'active' : ''} ">${i + 1}
     </a></li>
    `
  }

  paginationContent = `
    <li><a href="javascript:;" data-page="-1" class="prev pages">&laquo</a></li>
      ${ paginationContent}
    <li><a href="javascript:;" data-page="100" class="next pages">&raquo;</a></li>
  `

  pagination.innerHTML = paginationContent
  // rePage(paginationContent)
}

//監控頁面按鈕
pagination.addEventListener('click', e => {
  if (e.target.nodeName === "A") {
    paginationChange(e.target)
    setActiveCss(e.target, 'page')
  }

})

//頁數切換更換資料(包含前後按鈕)
function paginationChange(target) {
  let checkPage = target.dataset.page
  if (checkPage === '-1') {
    checkPage = --currentPage <= 0 ? 1 : currentPage
  } else if (checkPage === '100') {
    checkPage = currentTotalPage - currentPage !== 0 ? ++currentPage : currentPage
  }

  currentPage = checkPage
  getPageData(checkPage, currentData)
}

//清除nav-active、pages並重設
function setActiveCss(ckeckTarget, targetMethod) {
  //判斷是nav還是pages
  let changeClass = ''
  let toggleClass = ''
  if (targetMethod === 'nav') {
    changeClass = '.nav-link'
    toggleClass = 'nav-active'
  } else if (targetMethod === 'page') {
    changeClass = '.pages'
    toggleClass = 'active'
  }

  //把所有active都清掉
  const changetarget = document.querySelectorAll(changeClass)
  changetarget.forEach(item => {
    item.classList.remove(toggleClass)
    if (targetMethod === 'nav') item.children[0].classList.remove('d-inline-block')

  })

  //如果是前後一頁要另外call setPreNextPage()處理active的目標 否則在ckeckTarget就加上active
  if (ckeckTarget.dataset.page === '-1' || ckeckTarget.dataset.page === '100') {
    setPreNextPage(ckeckTarget)
  } else {
    ckeckTarget.classList.add(toggleClass)
  }

  if (targetMethod === 'nav') { ckeckTarget.children[0].classList.add('d-inline-block') }


}

//篩選目前頁面的資料
function getPageData(checkPage, data) {
  let pageData = data.slice((checkPage - 1) * ITEM_PER_PAGE, checkPage * ITEM_PER_PAGE)
  renderCollection(pageData)

}

//增加點選後的頁面active css
function setPreNextPage() {
  let prePage = document.querySelector(`[data-page="${currentPage}"]`)
  prePage.classList.add('active')
}


//監控searchInput
searchInput.addEventListener('keyup', e => {
  let indexContent = ''
  const regex = new RegExp(searchInput.value.replace(/\\/g, ""), 'i')
  currentNav = currentNav.replace(/[0-9]/g, '').toLowerCase().trim()

  switch (currentNav) {
    case 'female':
      indexContent = 'female'
      break
    case 'male':
      indexContent = 'male'
      break
    default:
      indexContent = 'origin'
      break
  }

  currentData = originDataArray[indexContent].filter(item => item.name.match(regex) || item.surname.match(regex))
  currentPage = InitPage
  updateContent(currentData)

})


//更新頁面包含頁數、卡片內容、Nav數目
function updateContent(updateDate) {
  renderPages(updateDate)
  getPageData(InitPage, updateDate)
  renderNavItem(updateDate.length)
  // dragDrop()
}

// function rePage(pageHtml) {
//   let suitSize = parseInt(pagination.offsetWidth) * 0.8

//   console.log(pageHtml)



//   pagination.innerHTML = pageHtml

// }

// const abc = document.querySelector('.people_item')


//抓出所有people-item並設定監控
function drag() {
  let dragSources = document.querySelectorAll('[draggable="true"]')
  dragSources.forEach(dragSource => {
    dragSource.addEventListener('dragstart', dragStart)
    dragSource.addEventListener('dragend', dragEnd)
  })
}


function dragStart(e) {
  e.dataTransfer.setData('text', e.target.dataset.id)
  folderIcon.classList.add('typcn-folder-open')
  folderIcon.classList.remove('typcn-folder')
  dropTarget.classList.add('text-danger')

}



let dropTarget = document.querySelector('#target-container')
dropTarget.addEventListener('drop', dropped)
dropTarget.addEventListener('dragenter', cancelDefault)
dropTarget.addEventListener('dragover', cancelDefault)
dropTarget.addEventListener('mouseenter', () => favoriteText.textContent = 'Go back Index here!')
dropTarget.addEventListener('mouseleave', () => favoriteText.textContent = 'Remove person here!')

function dropped(e) {
  let id = e.dataTransfer.getData('text')
  deleteFavoriteItem(id)
  cancelDefault(e)
}

function cancelDefault(e) {
  e.preventDefault()
  e.stopPropagation()
  return false
}


function dragEnd(e) {
  let favoriteLength = 0
  if (JSON.parse(localStorage.getItem('favoritePerson'))) {
    favoriteLength = JSON.parse(localStorage.getItem('favoritePerson')).length
  }

  folderIcon.classList.remove('typcn-folder-open')
  dropTarget.classList.remove('text-danger')

  if (favoriteLength > 0) {
    folderIcon.classList.remove('typcn-folder')
    folderIcon.classList.add('typcn-folder-add')
  } else {
    folderIcon.classList.add('typcn-folder')
  }

}


function deleteFavoriteItem(id) {

  const index = originDataArray.origin.findIndex(item => item.id === Number(id))
  if (index === -1) return

  originDataArray.origin.splice(index, 1)

  localStorage.setItem('favoritePerson', JSON.stringify(originDataArray.origin))

  sortData(originDataArray.origin)
}

