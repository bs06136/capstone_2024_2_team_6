package main

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	baseUrl := "http://capstonedesign.duckdns.org:8080/signal"
	sendFile(baseUrl, "C:\\Users\\bszxc\\IdeaProjects\\capstone_2024_2_team_6\\test\\test2.txt", true, false)
}

func sendFile(baseUrl, filePath string, save bool, archive bool) {
	var urlBuilder strings.Builder
	urlBuilder.WriteString(baseUrl)
	params := []string{}

	if save {
		params = append(params, "save=true")
	}
	if archive {
		params = append(params, "archive=true")
	}
	if len(params) > 0 {
		urlBuilder.WriteString("?")
		urlBuilder.WriteString(strings.Join(params, "&"))
	}

	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("파일을 열 수 없습니다:", err)
		return
	}
	defer file.Close()

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)

	// 파일 이름만 추출
	fileName := filepath.Base(filePath)

	// 파일 파트를 생성할 때 파일 이름만 전달
	filePart, err := multipartWriter.CreateFormFile("file", fileName)
	if err != nil {
		fmt.Println("파일 파트를 생성할 수 없습니다:", err)
		return
	}
	_, err = io.Copy(filePart, file)
	if err != nil {
		fmt.Println("파일을 읽는 중 오류 발생:", err)
		return
	}

	multipartWriter.Close()

	request, err := http.NewRequest("POST", urlBuilder.String(), &requestBody)
	if err != nil {
		fmt.Println("요청 생성 실패:", err)
		return
	}
	request.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		fmt.Println("HTTP 요청 실패:", err)
		return
	}
	defer response.Body.Close()

	fmt.Println("HTTP 상태 코드:", response.StatusCode)
	if response.StatusCode == http.StatusOK {
		fmt.Println("파일이 성공적으로 전송되었습니다.")
	} else {
		fmt.Println("파일 전송 실패:", response.Status)
	}
}
