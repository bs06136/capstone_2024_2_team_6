package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// 서버의 URL과 포트 번호를 분리하여 변수로 저장
	serverURL := "http://capstonedesign.duckdns.org"
	port := "8080"

	// 테스트용 경로를 붙인 전체 URL 생성
	testPath := "/signal?value=1"
	fullURL := fmt.Sprintf("%s:%s%s", serverURL, port, testPath)

	// GET 요청을 보냄
	resp, err := http.Get(fullURL)
	if err != nil {
		fmt.Println("요청 실패:", err)
		return
	}
	defer resp.Body.Close()

	// 응답 내용 읽기
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("응답 읽기 실패:", err)
		return
	}

	// 서버 응답 출력
	fmt.Println("서버 응답:", string(body))
}
