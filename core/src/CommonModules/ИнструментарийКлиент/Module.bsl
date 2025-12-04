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