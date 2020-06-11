$(document).ready(function () {
    // 검색 구분 값 선택
    $('.dropdown-item').click(function (e) {
        $('#btn-toggle').html(e.target.title);
    });

    // 검색어 엔터키 이벤트
    $('#searchTxt').keypress(function (e) {
        if (e.keyCode == 13) setPagination(1);
    });
    $('#searchKor').keypress(function (e) {
        if (e.keyCode == 13) setPagination(1);
    });
    $('#searchEng').keypress(function (e) {
        if (e.keyCode == 13) setPagination(1);
    });
    $('#searchCat').keypress(function (e) {
        if (e.keyCode == 13) setPagination(1);
    });


    // 검색 버튼 클릭 이벤트
    $('#btn-search').click(function () {
        setPagination(1);
    });
    $('#btn-more-search').click(function () {
        setPagination2(1);
    });
});

/**
 * @name:   setPagination
 * @param: pageNum {String}
 * @return:
 * @description: setting pagination value
 */
function setPagination(pageNum) {
    var cat = $('#btn-toggle').text();
    var txt = $('#searchTxt').val();

    if(!txt) return alert('검색어를 입력하세요.');

    var params = { page: pageNum, kor: kor, eng: eng, cat: cat, thm: '' };

    setPagingDataList("/search", params, "#dataTable");
}

/**
 * @name:   setPagination
 * @param: pageNum {String}
 * @return:
 * @description: setting pagination value
 */
function setPagination2(pageNum) {

    $('#btn-more-close').click();

    var kor = $('#searchKor').val();
    var eng = $('#searchEng').val();
    var thm = $('#searchCat').val();


    var params = { page: pageNum, kor: kor, eng: eng, cat: cat, thm: thm };

    setPagingDataList("/detail", params, "#dataTable");
}

/**
 * @name:   resetPagingContent
 * @param:
 * @return: html {String}
 * @description: setting pagination value
 */
function resetPagingContent() {
    var html = '<li class="page-item disabled"><a class="page-link" href="#">&lt;&lt;</a></li>'
        + '<li class="page-item disabled"><a class="page-link" href="#">&lt;</a></li>'
        + '<li class="page-item active"><a class="page-link" href="#">1</a></li>'
        + '<li class="page-item disabled"><a class="page-link" href="#">&gt;</a></li>'
        + '<li class="page-item disabled"><a class="page-link" href="#">&gt;&gt;</a></li>';

    return html;
}

/**
 * @name:   resetPagingContent
 * @param: totalCnt {Integer}
 * @param: dataSize {Integer}
 * @param: PageSize {Integer}
 * @param: pageNo {Integer}
 * @return:
 * @description: create pagination content
 */
function createPagingContents(totalCnt, dataSize, pageSize, pageNo) {
    totalCnt = parseInt(totalCnt);// 전체레코드수
    dataSize = parseInt(dataSize); // 페이지당 보여줄 데이타수
    pageSize = parseInt(pageSize); // 페이지 그룹 범위 1 2 3 5 6 7 8 9 10
    pageNo = parseInt(pageNo); // 현재페이지

    var html = new Array();

    if (!totalCnt) {
        return resetPagingContent();
    }

    // 페이지 카운트 총블럭수
    var pageCnt = totalCnt % dataSize;
    if (pageCnt == 0) {
        pageCnt = parseInt(totalCnt / dataSize);
    } else {
        pageCnt = parseInt(totalCnt / dataSize) + 1;
    }

    //페이지 그룹 번호
    var pRCnt = parseInt(pageNo / pageSize);
    if (pageNo % pageSize == 0) {
        pRCnt = parseInt(pageNo / pageSize) - 1;
    }

    //첫번째 번호
    if (pRCnt != 0) {
        html.push('<li class="page-item"><a class="page-link" href="javascript:setPagination(1)">&lt;&lt;</a></li>');
    }

    //이전 번호
    if (pageNo > pageSize) {
        var s2;
        if (pageNo % pageSize == 0) {
            s2 = pageNo - pageSize;
        } else {
            s2 = pageNo - pageNo % pageSize;
        }
        html.push('<li class="page-item"><a class="page-link" href="javascript:setPagination' + '(' + s2 + ')">&lt;</a></li>');
    }

    //페이지 리스트
    for (var index = pRCnt * pageSize + 1; index < (pRCnt + 1) * pageSize + 1; index++) {
        if (index == pageNo) {
            html.push('<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">' + index + '</a></li>');
        } else {
            html.push('<li class="page-item"><a class="page-link" href="javascript:javascript:setPagination' + '(' + index + ')">' + index + '</a></li>');
        }

        if (index == pageCnt) {
            break;
        }
    }

    //다음 번호
    if (pageCnt > (pRCnt + 1) * pageSize) {
        html.push('<li class="page-item"><a class="page-link" href="javascript:setPagination' + '(' + ((pRCnt + 1) * pageSize + 1) + ')">&gt;</a></li>');
    }

    //마지막 번호
    if (pageCnt > (pRCnt + 1) * pageSize) {
        html.push('<li class="page-item"><a class="page-link" href="javascript:setPagination' + '(' + pageCnt + ')">&gt;&gt;</a></li>');
    }

    $('#pagination').html(html.join(""));
}

/**
 * @name:   setPagingDataList
 * @param: url {String}
 * @param: param {Object}
 * @param: container {String}
 * @return:
 * @description: create pagination content
 */
// search pagination data
function setPagingDataList(url, param, container) {

    var pageNo = parseInt(param.page); // 현재페이지

    $.ajax({
        url: url,
        data: param,
        dataType: "json",
        beforeSend: function (xhr) {
            $('.loading').show();
        },
        complete: function (msg) {
            $('.loading').hide();
        },
        success: function (json) {
            var total = 0;
            $(container + " tbody").empty();

            if (json.status == 200 && json.items.length > 0) {
                total = json.items[0].total;

                $('#searchCount').text(total);

                $.each(json.items, function (idx, value) {
                    var html = "<tr>"
                        + "	<th scope='row'>" + ((idx + 1) + ((pageNo - 1)  * 5))  + "</th>"
                        + "	<td>" + value.se + "</td>"
                        + "	<td>" + value.word_ko + "</td>"
                        + "	<td>" + value.word_en + "</td>"
                        + "	<td>" + value.word_ab + "</td>"
                        + "	<td>" + value.thema + "</td>"
                        + "</tr>";

                    $(html).appendTo($(container + " tbody"));
                });

                createPagingContents(total, 5, 5, pageNo);
            }
            else {
                $('#searchCount').text(total);
                $('#pagination').html(resetPagingContent());

                alert('검색 결과가 존재하지 않습니다.');
            }

        },
        error: function (err) {
            console.log(err);
        }
    });
}
