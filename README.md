# mychat
vue, firebase를 이용해 간단한 채팅 웹앱 만들기

## Features
- vue, vuex, vue-router, vuex-saga, node-sass
- [**firebase**](#documentation): 데이터 저장, Auth 및 socket.io 통신
- [**Vue Material**](https://vuematerial.io/getting-started/): 프로토타입 UI
* storybook: 채팅 말풍선 컴포넌트만 테스트, 그외 vuematerial 사용


## Getting started
```
npm install

npm run serve

npm run build


- stroybook

cd vue-storybook
npm run storybook
```

## flow

1) 아이디 생성(email & google Auth) 후 로그인 > 멤버리스트 이동

2) 멤버 선택 후 > 조인시 방이 개설됨
- 방이 개설되기 전 전제 조건이 따름
    
    2-1) 1:1 대화 일 경우 이전에 대화했던 채팅방으로 이동
       
       2-1-1) 데이터 형식: private 노드
                - myAuth
                - 생대방 Auth을 기록
                
       2-1-2) 나와 상대방 같은 key로 개설

    2-2) 그룹방을 개설
        - 그룹에 속한 멤버들 모두 같은 key로 개설 

3) 리스트
    1-1) 채팅방에서 최근 입력한 메세지 리스트에서 한줄로 표시
    1-2) 방 삭제 
    1-2) 즐겨찾기 방은 최상위로 위치


4) 대화     
    
    3-1) 오늘 데이터는 서버에 저장되고 이전 대화는 로컬스토리지에 저장하고 이전 메세지를 확인할때 쓴다.
    
    3-2) 오늘 대화한 데이터는 서버에 날짜가 바뀔때 마다 갱신한다
    
    3-3) 이미지 프리뷰 및 저장
    
    3-4) 메세지에 url에 존재 할 경우 링크로 

    3-5) 메세지 수신시 :
        - 디바이스 하단일때, 스크롤이동
        - 이전 메세지를 보고 있을 때, 토스트 알림 레이어 추가

    3-6) 메세지 읽음 처리



0) 새로고침 시 세션을 확인해서 내 계정정보를 store에 저장한다.


## ERD

![chat erd](./dist/chat.png)

## stotybook
![storybook](./public/st-book.jpg)

# v2 branch
1. 메세지 상태(읽음, 읽지 않음)

    1-1. 1:1대화와 그룹 대화일때 상태 관리는 어떻게 처리 ?



2. 챗화면에서 메세지 수신시 현재 위치 상태 확인

    2-1. 화면에 하단일때 자동 스크롤

    2-2. 이전 메세지를 보는 중에 방해하지 않아야한다



3. 이전 메세지 링크타입 및 이미지 타입 구현

4. 입력폼에서 엔터입력시 메세지 push

5. 신규계정 생성 후 접속된 멤버와 챗팅시 챗리스트화면이 안나오는 이슈 수정

