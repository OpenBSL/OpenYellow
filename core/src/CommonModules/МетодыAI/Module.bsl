// Copyright (c) 2023-2025 Anton Tsitavets

// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// https://github.com/OpenBSL/OpenYellow

//@skip-check undefined-variable
//@skip-check bsl-legacy-check-string-literal

#Область СлужебныйПрограммныйИнтерфейс

Функция ПолучитьСаммариРепозитория(Знач Репозиторий) Экспорт
	
	Если Не ИнструментарийВызовСервера.ПолучитьНастройку("ИспользоватьAI") Тогда
		Возврат "";
	КонецЕсли;
	
	ОтветGithub = Репозиторий.ОтветGithub;
	Readme      = Репозиторий.Readme;
	
	Если Не ЗначениеЗаполнено(ОтветGithub) Или Не ЗначениеЗаполнено(Readme) Тогда
		Возврат "";	
	КонецЕсли;
	
	Промпт = ПолучитьОбщийМакет("ПромптОписаниеРепозитория").ПолучитьТекст();
	Промпт = СтрШаблон(Промпт, Репозиторий.URL, ОтветGithub, Readme);
	
    URL    = ИнструментарийВызовСервера.ПолучитьНастройку("АдресAI");
    Токен  = ИнструментарийВызовСервера.ПолучитьНастройку("ТокенAI");

    Сообщения = Новый Массив;
    Сообщения.Добавить(OPI_OpenAI.ПолучитьСтруктуруСообщения("user", Промпт));

    Модель = "gpt-4.1";

    Результат = OPI_OpenAI.ПолучитьОтвет(URL, Токен, Модель, Сообщения);
	
	Попытка
		Возврат Результат["choices"][0]["message"]["content"];
	Исключение
		ИнструментарийВызовСервера.ЗаписатьИсключение(OPI_Инструменты.JSONСтрокой(Результат));
		Возврат "";
	КонецПопытки;
	
КонецФункции

Функция ПолучитьСаммариРелиза(Знач Релиз) Экспорт
	
	Если Не ИнструментарийВызовСервера.ПолучитьНастройку("ИспользоватьAI") Тогда
		Возврат "";
	КонецЕсли;
	
	Описание    = Релиз.Репозиторий.Описание;
	ОтветGithub = Релиз.ОтветGithub;
	Readme      = Релиз.Репозиторий.Readme;
	
	Если Не ЗначениеЗаполнено(ОтветGithub) Тогда
		Возврат "";	
	КонецЕсли;
	
	Промпт = ПолучитьОбщийМакет("ПромптОписаниеРелиза").ПолучитьТекст();
	Промпт = СтрШаблон(Промпт, Описание, ОтветGithub, Readme);
	
    URL    = ИнструментарийВызовСервера.ПолучитьНастройку("АдресAI");
    Токен  = ИнструментарийВызовСервера.ПолучитьНастройку("ТокенAI");

    Сообщения = Новый Массив;
    Сообщения.Добавить(OPI_OpenAI.ПолучитьСтруктуруСообщения("user", Промпт));

    Модель = "gpt-4.1";

    Результат = OPI_OpenAI.ПолучитьОтвет(URL, Токен, Модель, Сообщения);
	
	Попытка
		Возврат Результат["choices"][0]["message"]["content"];
	Исключение
		ИнструментарийВызовСервера.ЗаписатьИсключение(OPI_Инструменты.JSONСтрокой(Результат));
		Возврат "";
	КонецПопытки;
	
КонецФункции


#КонецОбласти