import PropTypes from 'prop-types';
import React from 'react';
import {NavLink, Link, Route, Switch} from 'react-router-dom';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

import LayerIcon from '../../utility/LayerIcon';

import Mstyle from '../../model/Mstyle';
import Mlayer from '../../model/Mlayer';

import Vfield from '../Vfield';
import VlayerAdd from './VlayerAdd';
import VlayerEdit from './VlayerEdit';

export default class Vlayers extends React.Component {

	static propTypes = {
		error: PropTypes.object, // map
		handle: PropTypes.object,
		match: PropTypes.object,
		style: PropTypes.object
	}

	constructor (props){
		super(props);
		const {handle, match, style} = this.props;

		this.state = {
			layerAddShown:false,
			searchShow:false,
			search:null
		};

		this.redirectEmpty(handle, match, style);

		this.handle = {
			visibility:(layerId)=>{
				Mlayer.visibilityToggle(layerId);
			},
			searchShow:()=>{
				this.setState({searchShow:true});
			},
			searchHide:()=>{
				this.setState({
					searchShow:false,
					search:null
				});
			},
			searchChange:(field)=>{
				this.setState({search:field.value});
			},
			onDragEnd:(result)=>{
				console.log('draggable res:',result.source.index,result.destination.index);

				Mlayer.reorder(result.source.index,result.destination.index);
			}
		};
		for (let i in this.handle){
			this.handle[i] = this.handle[i].bind(this);
		}
	}

	componentWillReceiveProps (nextProps){
		const {handle, match, style} = nextProps;
		this.redirectEmpty(handle, match, style);
	}

	redirectEmpty (handle, match, style){
		if (style.has('layers') && style.get('layers').size > 0 && match.isExact){
			handle.routeReplace('layer/'+encodeURIComponent(style.getIn(['layers',0,
				'id'])));
		}
	}

	render (){
		const {error, match, handle, style} = this.props;

		if (!style.has('layers') || style.get('layers').size < 1){
			return <VlayerAdd handle={handle} style={style}/>;
		}

		const layers = style.get('layers');
		const maxContentH = window.innerHeight - 44;
		
		return <div className="row mr-0 h-100">
			<div className="col-5 pr-0 o-y-scroll" style={{maxHeight:maxContentH+'px'}}>
				<div className="left-col-title list-border-right">
					{this.state.searchShow ? 
						<div className="px-2 m-0 text-nav row">
							<div className="flex-2 property pt-1 pr-1">
								<Vfield field={{
									type:'string',
									name:'search',	
									value:this.state.search,
									placeholder:'Search for layer',
									controlled:false,
									inputClass:'form-control-sm font-sm',
									inputNoAC:true,
									autoFocus:true
								}} key="type" handle={{
									change:this.handle.searchChange
								}}/>
							</div>
							<div className="">
								<span className="icon-btn gray" onClick={this.handle.searchHide}>
									<i className="material-icons md-14">close</i>
								</span>
							</div>
						</div>
						:
						<h2 className="px-2 m-0 text-nav bg-light row">
							<div className="flex-2 text-overflow-ellipsis font-med">
								Layers ({layers.size})
							</div>
							<div className="">
								<span className="icon-btn gray" onClick={this.handle.searchShow}>
									<i className="material-icons md-14">search</i>
								</span>
								<Link className="ml-1 icon-btn gray" to={`${match.url}/add`}>
									<i className="material-icons md-14">add_circle_outline</i>
								</Link>
							</div>
						</h2>
					}
				</div>
					
				<div className="bg-light font-sm">
					<DragDropContext onDragEnd={this.handle.onDragEnd}>
						<Droppable droppableId="droppable">
							{(provided, snapshot) => (
								<div ref={provided.innerRef}>
									{layers !== undefined && layers.map((layer,i)=>{
										//console.log('layer:',layer);

										if (this.state.search && layer.get('id').toLowerCase().indexOf(this.state.search.toLowerCase()) === -1) return;

										let className = 'px-2 py-1 d-block link-list list-border-right position-relative p-list';
										if (error.hasIn(['layers',i])) className += ' error';

										const color = LayerIcon.getColor(layer) || '#FFFFFF';
										//console.log('color:',color);

										return <Draggable key={layer.get('id')} draggableId={layer.get('id')} index={i}>
											{(provided, snapshot) => (
												<div ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}>
													<NavLink to={`${match.url}/${layer.get('id')}`} 
														className={className} key={layer.get('id')}>

														<div className="list-left mr-2 ml-1 inline-block">
															<i className="material-icons md-shadow md-14"
																style={{color:''+color}}>{LayerIcon.getIcon(layer)}</i>
														</div>
														{layer.get('id')}
														<div onClick={()=>{this.handle.visibility(layer.get('id'))}} className="list-right ml-2">
															{layer.getIn(['layout','visibility']) === 'none' ?
																<i className="material-icons md-14 md-muted">visibility_off</i>
																:
																<i className="material-icons md-14">visibility</i>
															}
														</div>
													</NavLink>
												</div>
											)}
										</Draggable>
									})}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</div>
			</div>
			<div className="col-7 px-0 o-y-scroll" style={{maxHeight:maxContentH+'px'}}>
				<div className="p-1">
					<Switch>
						<Route path={`${match.url}/add`} 
							render={(props) => <VlayerAdd style={style} handle={handle} {...props}/>}/>
						<Route path={`${match.url}/:id`} 
							render={(props) => <VlayerEdit error={error} handle={handle} style={style} {...props}/>}/>
					</Switch>
				</div>
			</div>
		</div>
	}
};