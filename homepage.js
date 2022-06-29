const token = localStorage.getItem('eko-user')

const config = {
  headers: { Authorization: `Bearer ${JSON.parse(token).responseData.access_token}` }
};

var DateFormatter = {
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  formatDate: function (date, format) {
    var self = this;
    format = self.getProperDigits(format, /d+/gi, date.getDate());
    format = self.getProperDigits(format, /M+/g, date.getMonth() + 1);
    format = format.replace(/y+/gi, function (y) {
      var len = y.length;
      var year = date.getFullYear();
      if (len == 2)
        return (year + "").slice(-2);
      else if (len == 4)
        return year;
      return y;
    })
    format = self.getProperDigits(format, /H+/g, date.getHours());
    format = self.getProperDigits(format, /h+/g, self.getHours12(date.getHours()));
    format = self.getProperDigits(format, /m+/g, date.getMinutes());
    format = self.getProperDigits(format, /s+/gi, date.getSeconds());
    format = format.replace(/a/ig, function (a) {
      var amPm = self.getAmPm(date.getHours())
      if (a === 'A')
        return amPm.toUpperCase();
      return amPm;
    })
    format = self.getFullOr3Letters(format, /d+/gi, self.dayNames, date.getDay())
    format = self.getFullOr3Letters(format, /M+/g, self.monthNames, date.getMonth())
    return format;
  },
  getProperDigits: function (format, regex, value) {
    return format.replace(regex, function (m) {
      var length = m.length;
      if (length == 1)
        return value;
      else if (length == 2)
        return ('0' + value).slice(-2);
      return m;
    })
  },
  getHours12: function (hours) {
    return (hours + 24) % 12 || 12;
  },
  getAmPm: function (hours) {
    return hours >= 12 ? 'pm' : 'am';
  },
  getFullOr3Letters: function (format, regex, nameArray, value) {
    return format.replace(regex, function (s) {
      var len = s.length;
      if (len == 3)
        return nameArray[value].substr(0, 3);
      else if (len == 4)
        return nameArray[value];
      return s;
    })
  }
}

function format(date) {
  if (date) {
    return new Date(date).toString().slice(4, 15)
  } else {
    return false
  }
}

function subStr(data) {
  const myArr = data?.split("/", 3);
  if (myArr[2].includes('www')) {
    return myArr[2]?.substr(4)
  } else {
    return myArr[2]
  }
}

var btnLoad = document.getElementById('btnLoad')
var pageIndex = 0;
var listDatas = [];

function callApi(pageIndex) {
  axios.post(`https://test.fandelo.com/api/portal/fan/home`, {
    "pageIndex": pageIndex,
    "pageSize": 50,
    "status": 1
  },
    config
  ).then(
    (res) => {

      var listData = res.data.responseData.data
      listDatas.push.apply(listDatas, listData)
      // console.log(DateFormatter.formatDate(new Date(1659794400000), 'HH:mm DD MMM YYYY'))
      var htmls = listDatas.map((item) => {
        return `
          <div class="item">
                  <img src=${item.externalImageUrl || item.thumbnail.cdnLarge} alt="" />
                  <div>
                    <div class="detail-over">
                      <div>
                        <h3 class="fw-500 text-uppercase fs-5">${item.talent.displayName}</h3>
                        <div class="address">
                          <div class="${format(item.start) !== false ? "" : "d-none"}">
                            <i class="fa fa-clock-o"></i
                            ><span>${' '}${format(item.start)}</span>
                          </div>
                          <div class="${item.location ? "" : "d-none"}">
                            <i class="fa fa-dot-circle-o"></i
                            ><span>${item.location}</span>
                          </div>
                        </div>
                        <h6 class="pb-2 pt-3">${item.title}</h6>
                        <a class="link" href=${item?.link}>${item.link}? ${subStr(item?.link)}: ""</a>
                      </div>
                    </div>
                  </div>
                  <div class="detail-under">
                    <div class="under-left">
                    <span class="me-3">${moment(new Date(item.createdDate)).fromNow()}</span>  
                    </div>
                    <div class="under-right">
                      <span><i class="fa fa-heart"></i>${' '}${item.totalEmotion.totalLove}</span>
                      <span> <i class="fa fa-comment"></i>${' '}${item.totalComment}</span>
                    </div>
                  </div>
                </div>
          `
      })
      var html = htmls.join('');
      document.getElementById('masonry').innerHTML = html
    },
    (error) => {
      console.log(error);
    }
  );
}


callApi(pageIndex)
btnLoad.onclick = () => {
  callApi(pageIndex++)
}

console.log(pageIndex)