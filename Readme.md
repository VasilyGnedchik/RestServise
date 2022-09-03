# Задание 1. REST-сервис на NODE.js

Анализ текста на сайтах: сервис принимает на вход JSON с массивом URL'ов в теле POST-запроса, анализирует страницы по этим адресам, и возвращает PDF документ, в котором в таблице будут представлены три наиболее часто встречающихся слова длиннее 4 символов по каждому из URL'ов.
____
### Пример результата:

http://yandex.ru

Программирование | Санкт-Петербург | Маркет

http://habrahabr.ru

Разработка | Коллеги | тестирование

____

### Перед работой с проектом необходимо установить все его зависимости:
> npm install

____

### Работа с сервисом:

#### Для запуска сервиса вызвать команду:
> node index.js

#### Пример запроса:

POST / HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Content-Length: 57

[
        "http://habrahabr.ru"
]
