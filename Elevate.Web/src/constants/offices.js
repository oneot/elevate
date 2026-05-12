/**
 * @file offices.js
 * @description 전국 17개 시·도 교육청의 Microsoft 365 포털 URL과 한글 이름 상수.
 *
 * `offices`: 교육청 키 → M365 포털 URL 매핑
 * `officeNames`: 교육청 키 → 한글 이름 매핑
 *
 * MapSection 컴포넌트에서 지도 핀 렌더링 및 툴팁 표시에 사용한다.
 */

// 전국 교육청 Microsoft 365 포털 URL
export const offices = {
    Seoul: "https://o365.sen.go.kr",
    Incheon: "https://o365.ice.go.kr",
    Gyeonggi: "https://goedu.kr",
    Gangwon: "https://office365.gwe.go.kr",
    Sejong: "https://o365.sje.go.kr",
    Chungbuk: "https://cloud.cbe.go.kr",
    Chungnam: "https://o365.cne.go.kr",
    Daejeon: "https://www.dje365.kr",
    Gyeongbuk: "https://365.gyo6.net",
    Daegu: "https://o365.dge.go.kr",
    Ulsan: "https://o365.use.go.kr",
    Busan: "https://o365.pen.go.kr",
    Gyeongnam: "https://sw-ms.gne.go.kr",
    Jeonbuk: "https://getsw-s.jbe.go.kr",
    Jeonnam: "https://o365.jne.go.kr",
    Gwangju: "https://o365.gen.go.kr",
    JeJu: "https://o365.jje.go.kr",
};

// 교육청 한글 이름
export const officeNames = {
    Gyeongnam: "경남교육청",
    Daegu: "대구교육청",
    Seoul: "서울교육청",
    Busan: "부산교육청",
    Incheon: "인천교육청",
    Gyeonggi: "경기교육청",
    Sejong: "세종특별자치시교육청",
    Chungbuk: "충북교육청",
    Ulsan: "울산교육청",
    Chungnam: "충남교육청",
    Gyeongbuk: "경북교육청",
    JeJu: "제주특별자치도교육청",
    Daejeon: "대전교육청",
    Jeonnam: "전남교육청",
    Jeonbuk: "전북교육청",
    Gwangju: "광주교육청",
    Gangwon: "강원특별자치도교육청",
};
