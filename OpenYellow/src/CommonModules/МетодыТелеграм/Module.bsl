//@skip-check Undefined variable

#Область СлужебныйПрограммныйИнтерфейс

Процедура ОпубликоватьНовыйРепозиторий(Репозиторий) Экспорт
    
    Попытка
    Токен = Инструментарий.ПолучитьНастройку("ТокенТелеграм");
    Чат   = Инструментарий.ПолучитьНастройку("ЧатТелеграм");
    
    Шаблон = "%%E2%%9C%%8C *Пополнение!*
    |Новый проект от %1 - [%2](%3)!
    |
    |%8
    |
    |%%F0%%9F%%93%%9A *Язык*: %4
	|%%F0%%9F%%8D%%B4 *Это форк*: %5
    |%%F0%%9F%%93%%9C *Лицензия*: %6
    |%%F0%%9F%%93%%85 *Дата создания*: %7
	|
    |_Не забывайте ставить %%E2%%AD%%90 понравившимся проектам_";
    
    Текст = СтрШаблон(Шаблон
        , Репозиторий.Автор.Наименование
        , Репозиторий.Наименование
        , Репозиторий.URL
        , ?(ЗначениеЗаполнено(Репозиторий.Язык), Репозиторий.Язык, "Другое")
		, ?(Репозиторий.ЭтоФорк, "Да", "Нет")
        , ?(ЗначениеЗаполнено(Репозиторий.Лицензия), Репозиторий.Лицензия, "Нет")
        , Формат(Репозиторий.ДатаСоздания, "ДЛФ=DD")
        , Репозиторий.Описание);
		
	Клавиатура = ПолучитьКлавиатуруРепозитория(Репозиторий.URL, Репозиторий.Автор.URL);
    Ответ      = OPI_Telegram.ОтправитьТекстовоеСообщение(Токен, Чат, Текст, Клавиатура);
    
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
    Токен = Инструментарий.ПолучитьНастройку("ТокенТелеграм");
    Чат   = Инструментарий.ПолучитьНастройку("ЧатТелеграм");
    
    Автор       = Репозиторий.Автор.Наименование;
    Название    = Репозиторий.Наименование;
    
    URL       = "https://github.com/" + Автор + "/" + Название;
	URLРелиза = URL + "/releases/tag/" + Версия;
    
    Текст = "%F0%9F%94%A5 *Новый релиз!*
    |
    |%F0%9F%8F%B0 *Репозиторий*: [" + Автор + "/" + Название + "](" + URL + ")
    |%F0%9F%94%A2 *Версия*: " + Версия + "
    |%F0%9F%93%85 *Дата релиза*: " + Формат(Дата, "ДЛФ=DD") + "
    |
    |_Не забывайте ставить %E2%AD%90 понравившимся проектам_";
	
	Клавиатура = ПолучитьКлавиатуруРелиза(URL, URLРелиза);
    Ответ = OPI_Telegram.ОтправитьТекстовоеСообщение(Токен, Чат, Текст, Клавиатура);
    
    Исключение
        Инструментарий.ЗаписатьИсключение(ОписаниеОшибки());
    КонецПопытки;
    
КонецПроцедуры

Процедура ОпубликоватьПодборку() Экспорт
	
	Попытка
		
		Подборка = ПолучитьПоследнююПодборку();
		
		Если Подборка = Неопределено Тогда
			Возврат;
		КонецЕсли;
		
		ЭлементыПодборки = ПолучитьЭлементыПодборки(Подборка);
		ТекстПодборки    = ПолучитьТекстПодборки(Подборка, ЭлементыПодборки);
		
		Токен = Инструментарий.ПолучитьНастройку("ТокенТелеграм");
	    Чат   = Инструментарий.ПолучитьНастройку("ЧатТелеграм");
		
		Ответ = OPI_Telegram.ОтправитьТекстовоеСообщение(Токен, Чат, ТекстПодборки);
		
		МЗ = РегистрыСведений.ПубликацииПодборок.СоздатьМенеджерЗаписи();
		МЗ.Подборка = Подборка;
		МЗ.Период = ТекущаяДатаСеанса();
		МЗ.Записать(Истина);
		
    Исключение
        Инструментарий.ЗаписатьИсключение(ОписаниеОшибки());
    КонецПопытки;
		
КонецПроцедуры

#КонецОбласти

#Область СлужебныеПроцедурыИФункции

Процедура ОтправитьИзменениеВТелеграм(Знач ТаблицаИзменений)
    
    Токен = Инструментарий.ПолучитьНастройку("ТокенТелеграм");
    Чат   = Инструментарий.ПолучитьНастройку("ЧатТелеграм");
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
    
    Шаблон = "Репозиторий [%1](%2)" + Символы.ПС + "*+%3* %%E2%%AD%%90 (%4 всего)" + Символы.ПС;
    Текст  = "%F0%9F%8F%86 *Самые трендовые репозитории этой недели!*";
    Текст  = Текст + Символы.ПС + Символы.ПС;
    
    Пока ВыборкаДетальныеЗаписи.Следующий() Цикл
		
		Изменение = Строка(ВыборкаДетальныеЗаписи.Изменение);
		
        Текст = Текст
            + СтрШаблон(Шаблон
                , ВыборкаДетальныеЗаписи.Репозиторий
                , ВыборкаДетальныеЗаписи.URL
                , ?(СтрДлина(ВыборкаДетальныеЗаписи.Изменение) = 1, " " + Изменение, Изменение)
                , ВыборкаДетальныеЗаписи.Звезды);
                
        Текст = Текст + Символы.ПС;
        
    КонецЦикла;
    
    Текст = Текст + Символы.ПС;
    Текст = Текст + "_Не забывайте поддерживать понравившиеся репозитории - от этого зависит их дальнейшее развитие!_";
           
    Токен    = Инструментарий.ПолучитьНастройку("ТокенТелеграм");
    Чат      = Инструментарий.ПолучитьНастройку("ЧатТелеграм");

    Картинка = Справочники.Файлы.Тренды.Файл.Получить();
	
	Клавиатура = ПолучитьКлавиатуруТрендов();
    Ответ = OPI_Telegram.ОтправитьКартинку(Токен, Чат, Текст, Картинка, Клавиатура);
    
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
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%93%88 Перейти в таблицу рейтинга", СпособКодированияСтроки.URLВКодировкеURL), "https://openyellow.org/grid?data=top"));
    Строки.Добавить(Кнопки);

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%8E%80 О значках", СпособКодированияСтроки.URLВКодировкеURL), "https://openyellow.org/badges"));
    Строки.Добавить(Кнопки);

    СтруктураПараметра = Новый Структура("inline_keyboard,rows", Строки, 1);

    Клавиатура = OPI_Инструменты.JSONСтрокой(СтруктураПараметра);

    Возврат Клавиатура;
    
КонецФункции

Функция ПолучитьКлавиатуруТрендов()

    Строки = Новый Массив;

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%93%88 Перейти в таблицу рейтинга", СпособКодированияСтроки.URLВКодировкеURL), "https://openyellow.org/grid?data=top"));
    Строки.Добавить(Кнопки);

    СтруктураПараметра = Новый Структура("inline_keyboard,rows", Строки, 1);

    Клавиатура = OPI_Инструменты.JSONСтрокой(СтруктураПараметра);

    Возврат Клавиатура;
    
КонецФункции


Функция ПолучитьКлавиатуруРепозитория(URLРепозитория, URLАвтора)

    Строки = Новый Массив;

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%8C%8F Перейти к репозиторию", СпособКодированияСтроки.URLВКодировкеURL), URLРепозитория));
    Строки.Добавить(Кнопки);

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%99%8B Страница автора", СпособКодированияСтроки.URLВКодировкеURL), URLАвтора));
    Строки.Добавить(Кнопки);

    СтруктураПараметра = Новый Структура("inline_keyboard,rows", Строки, 1);

    Клавиатура = OPI_Инструменты.JSONСтрокой(СтруктураПараметра);

    Возврат Клавиатура;
    
КонецФункции

Функция ПолучитьКлавиатуруРелиза(URLРепозитория, URLРелиза)
	
	Строки = Новый Массив;
	
	Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%92%AB Перейти к релизу", СпособКодированияСтроки.URLВКодировкеURL), URLРелиза));
    Строки.Добавить(Кнопки);

    Кнопки = Новый Массив;
    Кнопки.Добавить(Новый Структура("text,url", РаскодироватьСтроку("%F0%9F%8C%8F Перейти к репозиторию", СпособКодированияСтроки.URLВКодировкеURL), URLРепозитория));
    Строки.Добавить(Кнопки);

    СтруктураПараметра = Новый Структура("inline_keyboard,rows", Строки, 1);

    Клавиатура = OPI_Инструменты.JSONСтрокой(СтруктураПараметра);

    Возврат Клавиатура;

КонецФункции

Функция ПолучитьПоследнююПодборку()
	
	Запрос = Новый Запрос;
	Запрос.Текст = 
		"ВЫБРАТЬ
		|	РепозиторииПодборки.Подборка КАК Подборка,
		|	СУММА(1) КАК Количество
		|ПОМЕСТИТЬ Подборки
		|ИЗ
		|	Справочник.Репозитории.Подборки КАК РепозиторииПодборки
		|
		|СГРУППИРОВАТЬ ПО
		|	РепозиторииПодборки.Подборка
		|;
		|
		|////////////////////////////////////////////////////////////////////////////////
		|ВЫБРАТЬ ПЕРВЫЕ 1
		|	Подборки.Подборка КАК Подборка,
		|	МАКСИМУМ(ЕСТЬNULL(ПубликацииПодборокСрезПоследних.Период, ДАТАВРЕМЯ(1, 1, 1))) КАК Поле1
		|ИЗ
		|	Подборки КАК Подборки
		|		ЛЕВОЕ СОЕДИНЕНИЕ РегистрСведений.ПубликацииПодборок.СрезПоследних КАК ПубликацииПодборокСрезПоследних
		|		ПО Подборки.Подборка = ПубликацииПодборокСрезПоследних.Подборка
		|ГДЕ
		|	Подборки.Количество > 4
		|
		|СГРУППИРОВАТЬ ПО
		|	Подборки.Подборка
		|
		|УПОРЯДОЧИТЬ ПО
		|	Поле1";
	
	РезультатЗапроса = Запрос.Выполнить();
	
	ВыборкаДетальныеЗаписи = РезультатЗапроса.Выбрать();
	
	Если ВыборкаДетальныеЗаписи.Следующий() Тогда
		Возврат ВыборкаДетальныеЗаписи.Подборка;
	Иначе
		Возврат Неопределено;
	КонецЕсли;

КонецФункции

Функция ПолучитьЭлементыПодборки(Подборка)
	
	Запрос = Новый Запрос;
	Запрос.Текст = 
		"ВЫБРАТЬ РАЗЛИЧНЫЕ
		|	РепозиторииПодборки.Ссылка КАК Ссылка
		|ИЗ
		|	Справочник.Репозитории.Подборки КАК РепозиторииПодборки
		|ГДЕ
		|	РепозиторииПодборки.Подборка = &Подборка";
	
	Запрос.УстановитьПараметр("Подборка", Подборка);
	
	РезультатЗапроса = Запрос.Выполнить().Выгрузить();
	СписокЭлементов  = Новый СписокЗначений;
	
	ГСЧ = Новый ГенераторСлучайныхЧисел();
	
	Пока СписокЭлементов.Количество() < 5 Цикл
		
		СлучайныйЭлемент = ГСЧ.СлучайноеЧисло(0, РезультатЗапроса.Количество() - 1); 
		СлучайныйЭлемент = РезультатЗапроса[СлучайныйЭлемент]["Ссылка"];
		
		Если СписокЭлементов.НайтиПоЗначению(СлучайныйЭлемент) = Неопределено Тогда
			СписокЭлементов.Добавить(СлучайныйЭлемент);
		Иначе
			Продолжить;
		КонецЕсли;
		
	КонецЦикла;
	
	Возврат СписокЭлементов.ВыгрузитьЗначения();

КонецФункции

Функция ПолучитьТекстПодборки(Подборка, ЭлементыПодборки)
	
	ШаблонПодборки = "%%F0%%9F%%9A%%80 *Подборка репозиториев по теме ""%1"" *
	|%2
	|%3
	|
	|_Не забывайте ставить %%E2%%AD%%90 понравившимся проектам_";
	
	ШаблонЭлемента = "
	|
	|%%E2%%96%%B6 [%1/%2](%3)
	|%4";
	
	ТекстЭлементов = "";
	
	Для Каждого ЭлементПодборки Из ЭлементыПодборки Цикл
		ТекстЭлементов = ТекстЭлементов + СтрШаблон(ШаблонЭлемента
			, ЭлементПодборки.Автор
			, ЭлементПодборки.Наименование
			, ЭлементПодборки.URL
			, ЭлементПодборки.Описание);
	КонецЦикла;
		
	ТекстПодборки = СтрШаблон(ШаблонПодборки
		, Подборка.Наименование
		, Подборка.Описание
		, ТекстЭлементов);
		
	Возврат ТекстПодборки;
	
КонецФункции

#КонецОбласти