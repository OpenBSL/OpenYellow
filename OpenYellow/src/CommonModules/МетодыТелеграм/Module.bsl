//@skip-check Undefined variable

#Область СлужебныйПрограммныйИнтерфейс

Процедура ОпубликоватьНовыйРепозиторий(Репозиторий) Экспорт
    
    Попытка
    Токен = Константы.ТокенТелеграм.Получить();
    Чат   = Константы.ЧатТелеграм.Получить();
    
    Шаблон = "<b>Пополнение!</b>
    |Новый проект от %1 - <a href=""%3"">%2</a>!
    |
    |%7
    |
    |Язык: %4
    |Лицензия: %5
    |Ссылка: %6
    |";
    
    Текст = СтрШаблон(Шаблон
        , Репозиторий.Автор.Наименование
        , Репозиторий.Наименование
        , Репозиторий.URL
        , ?(ЗначениеЗаполнено(Репозиторий.Язык), Репозиторий.Язык, "другое")
        , ?(ЗначениеЗаполнено(Репозиторий.Лицензия), Репозиторий.Лицензия, "нет")
        , Репозиторий.URL
        , Репозиторий.Описание);
            
    Ответ = OPI_Telegram.ОтправитьТекстовоеСообщение(Токен, Чат, Текст, , "HTML");
    
    Исключение
        Инструментарий.ЗаписатьИсключение(ОписаниеОшибки());
    КонецПопытки;
 
КонецПроцедуры

Процедура ОпубликоватьИзменения() Экспорт
    
    Попытка
    Запрос = Новый Запрос;
    Запрос.Текст = 
        "ВЫБРАТЬ ПЕРВЫЕ 500
        |	СтатистикаРепозиториев.Репозиторий КАК Репозиторий,
        |	СтатистикаРепозиториев.ПрошлоеМесто КАК ПрошлоеМесто,
        |	АВТОНОМЕРЗАПИСИ() КАК ТекущееМесто
        |ПОМЕСТИТЬ Отбор
        |ИЗ
        |	РегистрСведений.СтатистикаРепозиториев КАК СтатистикаРепозиториев
        |ГДЕ
        |	НЕ СтатистикаРепозиториев.Репозиторий.ПометкаУдаления
        |
        |УПОРЯДОЧИТЬ ПО
        |	СтатистикаРепозиториев.Звезды УБЫВ,
        |	СтатистикаРепозиториев.Форки УБЫВ,
        |	СтатистикаРепозиториев.Репозиторий.ДатаСоздания
        |;
        |
        |////////////////////////////////////////////////////////////////////////////////
        |ВЫБРАТЬ
        |	Отбор.Репозиторий.Автор.Наименование + ""/"" + Отбор.Репозиторий.Наименование КАК Репозиторий,
        |	Отбор.Репозиторий.URL КАК URL,
        |	Отбор.ПрошлоеМесто КАК ПрошлоеМесто
        |ИЗ
        |   Отбор КАК Отбор
        |
        |УПОРЯДОЧИТЬ ПО
        |   Отбор.ТекущееМесто";
    
    РезультатЗапроса = Запрос.Выполнить();
    
    Если РезультатЗапроса.Пустой() Тогда
        Возврат;
    КонецЕсли;
    
    ВыборкаДетальныеЗаписи = РезультатЗапроса.Выбрать();
    ТаблицаЗапроса         = Новый ТаблицаЗначений;
    
    ТаблицаЗапроса.Колонки.Добавить("Репозиторий");
    ТаблицаЗапроса.Колонки.Добавить("URL");
    ТаблицаЗапроса.Колонки.Добавить("ПрошлоеМесто");
    ТаблицаЗапроса.Колонки.Добавить("ТекущееМесто");
    ТаблицаЗапроса.Колонки.Добавить("Изменение");
    
    Счетчик = 1;
    Пока ВыборкаДетальныеЗаписи.Следующий() Цикл

        Если Счетчик < ВыборкаДетальныеЗаписи.ПрошлоеМесто Тогда
            
            НоваяПозиция = ТаблицаЗапроса.Добавить();
            ЗаполнитьЗначенияСвойств(НоваяПозиция, ВыборкаДетальныеЗаписи);
            НоваяПозиция.ТекущееМесто = Счетчик;
            НоваяПозиция.Изменение    = ВыборкаДетальныеЗаписи.ПрошлоеМесто - Счетчик;
            
        КонецЕсли;
        
        Счетчик = Счетчик + 1;
    КонецЦикла;
    
    Если ТаблицаЗапроса.Количество() = 0 Тогда
        Возврат;
    КонецЕсли;
    
    ТаблицаЗапроса.Сортировать("Изменение УБЫВ");
    ОтправитьИзменениеВТелеграм(ТаблицаЗапроса);
    
    Исключение
        Инструментарий.ЗаписатьИсключение(ОписаниеОшибки());
    КонецПопытки;

КонецПроцедуры

Процедура ОпубликоватьРелиз(Знач Репозиторий, Знач Версия, Знач Дата) Экспорт
    
    Попытка
    Токен = Константы.ТокенТелеграм.Получить();
    Чат   = Константы.ЧатТелеграм.Получить();
    
    Автор       = Репозиторий.Автор.Наименование;
    Название    = Репозиторий.Наименование;
    
    URL = "https://github.com/" + Автор + "/" + Название;
    
    Текст = "<b>Новый релиз!</b>
    |
    |Репозиторий: <a href=""" + URL + """>" + Автор + "/" + Название + "</a>
    |Версия: " + Версия + "
    |Дата релиза: " + Формат(Дата, "ДЛФ=DD") + "
    |
    |<a href=""" + URL + "/releases/tag/" + Версия + """>Перейти к релизу</a>";
    
    Ответ = OPI_Telegram.ОтправитьТекстовоеСообщение(Токен, Чат, Текст, , "HTML");
    
    Исключение
        Инструментарий.ЗаписатьИсключение(ОписаниеОшибки());
    КонецПопытки;
    
КонецПроцедуры

#КонецОбласти

#Область СлужебныеПроцедурыИФункции

Процедура ОтправитьИзменениеВТелеграм(Знач ТаблицаИзменений)
    
    Токен = Константы.ТокенТелеграм.Получить();
    Чат   = Константы.ЧатТелеграм.Получить();
    Вывод = 10;

    МакетОдного = Символы.ПС + "<b>#%4</b> - <a href=""%2"">%1</a> поднялся на %3 позиции(-й)";
    Текст       = "<b>Динамика изменения ТОП-500 за неделю!</b>" + Символы.ПС; 
    Рейтинг     = "https://openyellow.org/grid?data=top";
    Значки      = "https://openyellow.org/badges";
    
    Счетчик = 0;
    Для Каждого Позиция Из ТаблицаИзменений Цикл
        
        Если Счетчик < Вывод Тогда
            
            ТекущееМесто = ТабуляцияТекущегоМеста(Позиция.ТекущееМесто);
            Текст = Текст 
                + СтрШаблон(МакетОдного
                    , Позиция.Репозиторий
                    , Позиция.URL
                    , Позиция.Изменение
                    , ТекущееМесто);
        КонецЕсли;
                
        Счетчик = Счетчик + 1;
    КонецЦикла;
    
    Если Счетчик > Вывод Тогда
        Остаток = Счетчик - Вывод;
        Текст = Текст + Символы.ПС + Символы.ПС 
            + "И еще "
            + Строка(Счетчик)
            + " репозиториев. ";
    КонецЕсли;
        
    Текст = Текст 
        + Символы.ПС
        + Символы.ПС
        + " С полным списком рейтинга можно ознакомиться <a href=""" 
        + Рейтинг 
        + """>в таблице ТОП-500</a>, а разработчики проектов, находящихся в ТОП-е, могут использовать <a href="""
        + Значки
        + """>наш значок с указанием номера позиции</a> в своем репозитории";          
    
    Картинка   = Справочники.Файлы.Динамика.Файл.Получить();
    Клавиатура = ПолучитьКлавиатуруДинамики();
    Ответ      = OPI_Telegram.ОтправитьКартинку(Токен, Чат, Текст, Картинка, Клавиатура, "HTML");
    
    Инструментарий.ЗаписатьИсключение(OPI_Инструменты.JSONСтрокой(Ответ));
    
КонецПроцедуры

Процедура ОпубликоватьЕженедельныйТоп() Экспорт
    
    Запрос = Новый Запрос;
    Запрос.Текст = 
        "ВЫБРАТЬ ПЕРВЫЕ 5
        |   Тренды.Репозиторий.Автор.Наименование + ""/"" + Тренды.Репозиторий.Наименование КАК Репозиторий,
        |   СУММА(Тренды.Изменение) КАК Изменение,
        |   СтатистикаРепозиториев.Звезды КАК Звезды,
        |   Тренды.Репозиторий.URL КАК URL
        |ИЗ
        |   РегистрСведений.Тренды КАК Тренды
        |       ЛЕВОЕ СОЕДИНЕНИЕ РегистрСведений.СтатистикаРепозиториев КАК СтатистикаРепозиториев
        |       ПО Тренды.Репозиторий = СтатистикаРепозиториев.Репозиторий
        |ГДЕ
        |   Тренды.Период МЕЖДУ &Дата0 И &Дата1
        |   И НЕ Тренды.Репозиторий.ПометкаУдаления
        |
        |СГРУППИРОВАТЬ ПО
        |   СтатистикаРепозиториев.Звезды,
        |   Тренды.Репозиторий.Автор.Наименование + ""/"" + Тренды.Репозиторий.Наименование,
        |   Тренды.Репозиторий.URL
        |
        |УПОРЯДОЧИТЬ ПО
        |   Изменение УБЫВ";
    
    
    ТДС = ТекущаяДатаСеанса();
    
    Запрос.УстановитьПараметр("Дата0", ТДС - 60 * 60 * 24 * 7);
    Запрос.УстановитьПараметр("Дата1", ТДС);
    
    РезультатЗапроса = Запрос.Выполнить();
    
    ВыборкаДетальныеЗаписи = РезультатЗапроса.Выбрать();
    
    Шаблон = "<b>+%3</b> звезд(-ы) (%4 всего)" + Символы.Таб + " - <a href=""%2"">%1</a>";
    Текст  = "<b>Самые трендовые репозитории этой недели!</b>";
    Текст  = Текст + Символы.ПС + Символы.ПС;
    
    Пока ВыборкаДетальныеЗаписи.Следующий() Цикл
        
        Текст = Текст
            + СтрШаблон(Шаблон
                , ВыборкаДетальныеЗаписи.Репозиторий
                , ВыборкаДетальныеЗаписи.URL
                , ВыборкаДетальныеЗаписи.Изменение
                , ВыборкаДетальныеЗаписи.Звезды);
                
        Текст = Текст + Символы.ПС;
        
    КонецЦикла;
    
    Текст = Текст + Символы.ПС;
    Текст = Текст + "Не забывайте поддерживать понравившиеся репозитории - от этого зависит их дальнейшее развитие!";
           
    Токен    = Константы.ТокенТелеграм.Получить();
    Чат      = Константы.ЧатТелеграм.Получить();

    Картинка = Справочники.Файлы.Тренды.Файл.Получить();
    
    Ответ = OPI_Telegram.ОтправитьКартинку(Токен, Чат, Текст, Картинка, , "HTML");
    
КонецПроцедуры

Функция ТабуляцияТекущегоМеста(Знач Значение)
    
    Значение = Строка(Значение);
    
    Пока СтрДлина(Значение) < 3 Цикл
        Значение = Значение + " ";
    КонецЦикла;
    
    Возврат Значение;
    
КонецФункции

Функция ПолучитьКлавиатуруДинамики()

    Строки = Новый Массив;

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", "Перейти в таблицу рейтинга", "https://openyellow.org/grid?data=top"));
    Строки.Добавить(Кнопки);

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", "О значках", "https://openyellow.org/badges"));
    Строки.Добавить(Кнопки);

    СтруктураПараметра = Новый Структура("inline_keyboard,rows", Строки, 1);

    Клавиатура = OPI_Инструменты.JSONСтрокой(СтруктураПараметра);

    Возврат Клавиатура;
    
КонецФункции

#КонецОбласти