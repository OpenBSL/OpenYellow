// MIT License

// Copyright (c) 2023-2025 Anton Tsitavets

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// https://github.com/OpenBSL/OpenYellow

#Область СлужебныйПрограммныйИнтерфейс

Процедура ЗаписатьФайлВРеквизит(Знач Ссылка, Форма, Знач РеквизитДД, Знач РеквизитПути = "") Экспорт
	
	Если Форма.Модифицированность Тогда
		Форма.Записать();
	КонецЕсли;

	ДополнительныеПараметры = Новый Структура;
	ДополнительныеПараметры.Вставить("Ссылка"  , Ссылка);
	ДополнительныеПараметры.Вставить("Реквизит", РеквизитДД);
	ДополнительныеПараметры.Вставить("Путь"    , РеквизитПути);
	ДополнительныеПараметры.Вставить("Форма"   , Форма);
	
	Диалог 					= Новый ДиалогВыбораФайла(РежимДиалогаВыбораФайла.Открытие);
	Диалог.Заголовок 		= "Выберите файл";
	ОповещениеЗавершения 	= Новый ОписаниеОповещения("ВыборФайлаЗавершение"
		, ЭтотОбъект
		, ДополнительныеПараметры);
		
	Диалог.Показать(ОповещениеЗавершения);
	
КонецПроцедуры

Процедура ВыборФайлаЗавершение(ВыбранныеФайлы, ДополнительныеПараметры) Экспорт
	
	Если ВыбранныеФайлы <> Неопределено Тогда
		
		Форма = ДополнительныеПараметры["Форма"];
		ДополнительныеПараметры.Удалить("Форма");
		
		ИнструментарийВызовСервера.ЗаписатьФайлВРеквизиты(ВыбранныеФайлы[0], ДополнительныеПараметры); 
		
		Форма.Закрыть();
	  	ПерейтиПоНавигационнойСсылке(ПолучитьНавигационнуюСсылку(Форма));

	КонецЕсли;
	
КонецПроцедуры

#КонецОбласти