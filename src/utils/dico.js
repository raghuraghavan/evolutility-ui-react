/*! 
Evolutility-UI-React
https://github.com/evoluteur/evolutility-ui-react
(c) 2020 Olivier Giulieri
*/


// Helpers for models

import { fieldValue } from './format'

// - Field Types
const ft = {
	text: 'text',
	textml: 'textmultiline',
	bool: 'boolean',
	int: 'integer',
	dec: 'decimal',
	money: 'money',
	date: 'date',
	datetime: 'datetime',
	time: 'time',
	lov: 'lov',
	list: 'list', // many values for one field (behave like tags - return an array of strings)
	html: 'html',
	formula:'formula', // soon to be a field attribute rather than a field type
	email: 'email',
	image: 'image',
	doc: 'document',
	//geoloc: 'geolocation',
	url: 'url',
	color: 'color',
	hidden: 'hidden',
	json: 'json'
	//rating: 'rating',
	//widget: 'widget'
};
const fta = Object.keys(ft).map(k => ft[k])

const isFunction = x => typeof x === "function"

export const fieldTypes = ft
export const fieldTypeStrings = fta

export const fieldIsNumber = f => f.type===ft.int || f.type===ft.dec || f.type===ft.money

export const fieldIsDateOrTime = f => f.type===ft.date || f.type===ft.datetime || f.type===ft.time

export const fieldIsNumeric = f => fieldIsNumber(f) || fieldIsDateOrTime(f) 

export const fieldInCharts = f => fieldChartable(f) && !f.noCharts;

export const fieldChartable = f => f.type===ft.lov || f.type===ft.bool || fieldIsNumber(f);

export function hById(arr, prop='id'){
	var objH={};
	if(arr){
		arr.forEach(function(o){
			objH[o[prop]] = o; 
		});
	}
	return objH;
}

export function prepModel(m){
	if(m){
		if(!m._prepared){
			// - Model
			m.defaultViewOne = m.defaultViewOne || 'browse'
			//m.defaultViewMany = m.defaultViewMany || 'list'
			if(!m.label){
				m.label = m.title || m.namePlural || m.name;
			}
			// - Fields
			if(!m.fieldsH){
				m.fieldsH = hById(m.fields);
			}
			if(!m.titleField){
				m.titleField = m.fields[0];
			}
			if(m.fields.filter(fieldInCharts).length<1){
				m.noCharts = true
			}
			m._prepared = true
		}
		return m;
	}
	return null;
}

const prepModelCollecs = (m, models) => {
	if(m){
		if(!m._preparedCollecs){
			if(m.collections){
				m.collections.forEach(c => {
					if(c.object){
						const collecModel = models[c.object]
						if(collecModel){
							// - if no icon, get it from collec object
							if(!c.icon && collecModel.icon){
								c.icon = collecModel.icon
							}
							// - if no fields, get it from collec object (fields in list but not the object)
							if(!c.fields){
								c.fields = collecModel.fields.filter(f => f.inMany && !f.object===c.object)
							}
							const fsh = collecModel.fieldsH
							c.fields.forEach((f, idx) => {
								if(typeof(f) === 'string'){
									c.fields[idx] = JSON.parse(JSON.stringify(fsh[f]||{}))
								}
							})
						}else{
							console.log('Model "'+c.object+'" not found in model "'+m.id+'".')
						}
					}
				})
			}
			m._preparedCollecs = true
		}
		return m;
	}
	return null;
}

export const prepModels = (models) => {
	const ms = Object.keys(models)
	// need 2 passes for field map to be populated first, then collecs
	ms.forEach(m => { models[m] = prepModel(models[m]) })
	ms.forEach(m => { models[m] = prepModelCollecs(models[m], models) })
	return models
}

export const dataTitle = (m, data, isNew) => {
	if(m){
		let f, title=''
		if(isNew){
			title = 'New ' + (m.name || 'item')
		}else if(m.titleField){
			if(isFunction(m.titleField)){
				title = m.titleField(data)
			}else{
				f = m.fieldsH[m.titleField]
				if(!f){
					f = m.fields[0]
				}
				if(f && data){
					title = fieldValue(f, data[f.id])
				}
			}
		}
		return title 
	}else{
		return 'New item'
	}
}

export const isFieldMany = f => f.inList || f.inMany

export const fieldIsText = f => [ft.text, ft.textml, ft.url, ft.html, ft.email].indexOf(f.type)>-1;

export const fieldId2Field = (fieldIds, fieldsH) => fieldIds ? fieldIds.map(id => fieldsH[id] || null) : null

const dico = {
	fieldTypes: ft,
	fieldTypeStrings: fta,
	fieldIsNumber: fieldIsNumber,
	fieldIsDateOrTime: fieldIsDateOrTime,
	fieldIsNumeric: fieldIsNumeric,
	fieldInCharts: fieldInCharts,
	fieldChartable: fieldChartable,
	hById: hById,
	hByX: hById,
	prepModel: prepModel,
	prepModelCollecs: prepModelCollecs,
	dataTitle: dataTitle,
	isFieldMany: isFieldMany,
	fieldIsText: fieldIsText,
	fieldId2Field: fieldId2Field,
}

export default  dico;
