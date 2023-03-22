# sql-injection

SQL 인젝션 유형별 공격 및 대응기법 분석을 위한 테스트 환경

Test environment required to analyze attacks and countermeasures by type of SQL injection

## 구축 환경

* Node.js 18.13
* MySQL 8.0

## 사용법

1. 저장소 복제
2. ```/lib``` 폴더에 ```mysqlConfig.js``` 파일 생성
3. ```mysqlConfig.js``` 파일에 아래 코드 작성
```
var mysqlConfig = {
  host     : 'localhost',
  user     : '???',
  password : '???',
  database : '???'
};

module.exports = mysqlConfig;
```
4. 터미널을 열고 ```node main.js``` 실행