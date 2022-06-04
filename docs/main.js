const dictionary = (() => {
  const request = new XMLHttpRequest();
  request.open("get", "dict/cedict_ts.u8", false);
  request.send(null);

  const data = request.responseText.split("\n");

  let result = [];

  for (let i = 0; i < data.length; ++i) {
    if (data[i].length === 0 || data[i][0] === "#") {
      continue;
    }

    const line = data[i].split(" ");

    if (line[0].length !== 2) {
      continue;
    }

    if (line[2][line[2].length - 1] !== "1" && line[2][line[2].length - 1] !== "2" && line[2][line[2].length - 1] !== "3"
      && line[2][line[2].length - 1] !== "4" && line[2][line[2].length - 1] !== "5") {
      continue;
    }

    if (line[3][line[3].length - 2] !== "1" && line[3][line[3].length - 2] !== "2" && line[3][line[3].length - 2] !== "3"
      && line[3][line[3].length - 2] !== "4" && line[3][line[3].length - 2] !== "5") {
      continue;
    }

    result.push([line[0], line[1], line[2].slice(1), line[3].slice(0, -1)]);
  }

  return result;
})();

const inputElem = document.getElementById("word-list-input");
const tableElem = document.getElementById("table");
const failedElem = document.getElementById("failed");
const failedDescElem = document.getElementById("failed-description");
const failedWordsElem = document.getElementById("failed-words");
const detailElem = document.getElementById("detail");
const tonesElem = document.getElementById("tones");
const pinyinElem = document.getElementById("pinyin");

const cellElems = (() => {
  let result = [];
  for (let i = 0; i <= 4; ++i) {
    result.push([]);
    for (let j = 0; j <= 5; ++j) {
      result[i].push(document.getElementById(`c${i}${j}`));
    }
  }
  return result;
})();

function init(useSimplified) {
  failedElem.classList.add("hidden");
  tableElem.classList.add("hidden");
  detailElem.classList.add("hidden");

  failedDescElem.innerText = "";
  failedWordsElem.innerHTML = "";

  if (useSimplified) {
    pinyinElem.classList.add("simplified");
    pinyinElem.classList.remove("traditional");
  } else {
    pinyinElem.classList.add("traditional");
    pinyinElem.classList.remove("simplified");
  }

  for (let i = 1; i <= 4; ++i) {
    for (let j = 1; j <= 5; ++j) {
      cellElems[i][j].innerText = "";
      if (useSimplified) {
        cellElems[i][j].classList.add("simplified");
        cellElems[i][j].classList.remove("traditional");
      } else {
        cellElems[i][j].classList.add("traditional");
        cellElems[i][j].classList.remove("simplified");
      }
    }
  }
}

function e() {
  const words = inputElem.value.replace(/[\s,　，]+/g, ",").replace(/^,|,$/g, "").split(",");

  if (words.length === 1 && words[0] === "") {
    return;
  }

  const useSimplified = (document.querySelector("input[name=character-set]:checked").value === "simplified");
  init(useSimplified);

  let convertedWordIndices = Array(words.length).fill(-1);
  let numberFailed = 0;

  for (let i = 0; i < words.length; ++i) {
    for (let j = 0; j < dictionary.length; ++j) {
      if (words[i] === dictionary[j][0] || words[i] === dictionary[j][1]) {
        convertedWordIndices[i] = j;
        break;
      }
    }
    if (convertedWordIndices[i] === -1) {
      ++numberFailed;
    }
  }

  if (numberFailed > 0) {
    failedElem.classList.remove("hidden");
    failedDescElem.innerText = `以下の ${numberFailed} 個の単語の分類に失敗しました。辞書に無い、二字でない、または声調が決まっていない音節がある単語である可能性があります。`;
    failedWordsElem.innerHTML = "<ul>";
  }
  tableElem.classList.remove("hidden");

  for (let i = 0; i < convertedWordIndices.length; ++i) {
    if (convertedWordIndices[i] === -1) {
      failedWordsElem.innerHTML += `<li>${words[i]}</li>`;
    } else {
      const first = dictionary[convertedWordIndices[i]][2];
      const second = dictionary[convertedWordIndices[i]][3];
      const cellElem = cellElems[Number(first[first.length - 1])][Number(second[second.length - 1])];
      if (cellElem.innerHTML.length > 0) {
        cellElem.innerHTML += "&nbsp;";
      }
      cellElem.innerHTML += dictionary[convertedWordIndices[i]][useSimplified ? 1 : 0];
    }
  }

  failedWordsElem.innerHTML += "</ul>";
}

const img1Elem = document.getElementById("img1");
const img2Elem = document.getElementById("img2");

function s(u, v) {
  pinyinElem.innerHTML = "";
  tonesElem.innerHTML = `${u} 声 - ${v === 5 ? "軽" : String(v) + "&nbsp;"}声`;

  if (u === 3 && v === 3) {
    tonesElem.innerHTML += "（2 声 - 3 声に変調）";
  }

  detailElem.classList.remove("hidden");
  img1Elem.setAttribute("src", `img/${(u === 3 && v === 3) ? 2 : u}.svg`);
  img2Elem.setAttribute("src", `img/${v}.svg`);

  // ToDo: improve the algorithm
  const words = cellElems[u][v].innerHTML.split("&nbsp;");

  for (let i = 0; i < words.length; ++i) {
    for (let j = 0; j < dictionary.length; ++j) {
      if (words[i] === dictionary[j][0] || words[i] === dictionary[j][1]) {
        if (pinyinElem.innerHTML.length > 0) {
          pinyinElem.innerHTML += ",&nbsp;";
        }
        pinyinElem.innerHTML += `${words[i]}:&nbsp;${dictionary[j][2]}&nbsp;${dictionary[j][3][dictionary[j][3].length - 1] === "5" ? dictionary[j][3].slice(0, -1) : dictionary[j][3]}`;
        break;
      }
    }
  }
}
