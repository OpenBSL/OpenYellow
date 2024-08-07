//@skip-check Undefined variable
    
#Область СлужебныйПрограммныйИнтерфейс

Функция ПолучитьСписокРепозиториев(Знач Страница = 1, Знач Запрос) Экспорт
    
    URL         = Запрос.Запрос + "+fork:true&page=" + Строка(Страница) + "&visibility=public";
    Авторизация = "token " + Константы.GitHubToken.Получить();
    Заголовки   = Новый Соответствие;
    Заголовки.Вставить("Authorization", Авторизация);
    Заголовки.Вставить("Content-Type", "text/html; charset=utf-8");
    
    Ответ = OPI_Инструменты.Get(URL, , Заголовки);
    
	Возврат Ответ;
	   
КонецФункции

Функция ПолучитьПоследнийРелиз(Знач Репозиторий) Экспорт
    
    URL = "https://api.github.com/repos/" 
        + Репозиторий.Автор.Наименование 
        + "/" 
        + Репозиторий.Наименование + "/releases/latest";
        
    Авторизация = "token " + Константы.GithubTokenДополнительный.Получить();
    Заголовки   = Новый Соответствие;
    Заголовки.Вставить("Authorization", Авторизация);
    Заголовки.Вставить("Content-Type", "text/html; charset=utf-8");
    
    Ответ = OPI_Инструменты.Get(URL, , Заголовки);
    
	Возврат Ответ;

КонецФункции

Функция ФорматДата(Знач ДатаСтрока) Экспорт
	
	Возврат Дата(СтрЗаменить(Лев(ДатаСтрока, СтрНайти(ДатаСтрока, "T") - 1), "-", ""));
	
КонецФункции

Процедура ЗаписатьИсключение(Знач ОписаниеОшибки) Экспорт
    
    МЗ = РегистрыСведений.Исключения.СоздатьМенеджерЗаписи();
    МЗ.Период = ТекущаяДатаСеанса();
    МЗ.UID = Строка(Новый УникальныйИдентификатор);
    МЗ.ОписаниеОшибки = ОписаниеОшибки;
    МЗ.Записать(Истина);
    
КонецПроцедуры

Процедура ЗаписатьФайлВРеквизиты(Знач Путь, Знач СтруктураЗаписи) Экспорт
	
	ФайлДвоичные   = Новый ДвоичныеДанные(Путь);
	РеквизитЗаписи = СтруктураЗаписи["Реквизит"];
	РеквизитПути   = СтруктураЗаписи["Путь"];
	
	ОбъектЗаписи = СтруктураЗаписи["Ссылка"].ПолучитьОбъект();
	ОбъектЗаписи[РеквизитЗаписи] = Новый ХранилищеЗначения(ФайлДвоичные);
	
	Если ЗначениеЗаполнено(РеквизитПути) Тогда
		ОбъектЗаписи[РеквизитПути] = Путь;
	КонецЕсли;
	
	ОбъектЗаписи.Записать();

КонецПроцедуры

Процедура ЗаписатьJSONВФайл(Знач Данные, Знач Путь) Экспорт
    
    JSON = Новый ЗаписьJSON();
    ПараметрыЗаписиJSON = Новый ПараметрыЗаписиJSON( , Символы.Таб);

    JSON.ОткрытьФайл(Путь, "UTF-8", , ПараметрыЗаписиJSON);
    
    ЗаписатьJSON(JSON, Данные);
    JSON.Закрыть();
    
КонецПроцедуры

#КонецОбласти
