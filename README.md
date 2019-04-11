# mychat

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).




## Flow
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

3) 대화     
    3-1) 오늘 데이터는 서버에 저장되고 이전 대화는 로컬스토리지에 저장하고 이전 메세지를 확인할때 쓴다.
    3-2) 오늘 대화한 데이터는 서버에 날짜가 바뀔때 마다 갱신한다



0) 새로고침 시 세션을 확인해서 내 계정정보를 store에 저장한다.


### 내부 Flow
Action이  call 될 때(vuex-saga run), mutations가 state로 전달될때 namespace.js 를 통해 전달