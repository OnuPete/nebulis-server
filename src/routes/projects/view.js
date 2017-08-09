import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Layout from './../Layout';
import Teams from '../../components/Teams';
import * as actions from '../../actions/nebulisActions.js'
import { getStore } from './../../store/configureStore';
import { PlusIcon } from 'mdi-material-ui';
import RaisedButton from 'material-ui/RaisedButton';


import ghoulie from 'ghoulie';

export default class ProjectsContainer extends Component {
	constructor(props) {
		super(props);

		this.state = {

			// map the model to state
			loading: getStore().getState().projectsModel.loading,
			downloading: getStore().getState().teamsModel.downloading,
			project: getStore().getState().projectsModel.project,
			teams: getStore().getState().teamsModel.teams,
			openAddTeams: false
		};

		// when the store changes re-map the model to state
		getStore().subscribe(() => {
			this.setState({
				loading: getStore().getState().projectsModel.loading,
				downloading: getStore().getState().teamsModel.downloading,
				project: getStore().getState().projectsModel.project,
				teams: getStore().getState().teamsModel.project
			}, () => {

			});
		});

		// notify ghoulie when this component is instantiated
		ghoulie.emit('PROJECT_PAGE_LOADED');

		// when ghoulie receives a RELOAD_PROJECTS event (from within a
    // unit test) log the event and call getProject()
		ghoulie.on('RELOAD_PROJECT', () => {
			ghoulie.log('RELOADING PROJECT !!!!');
			this.getProject(this.props.params.id);
		});
	}

	componentWillMount() {
		console.log('this.props', this.props);
		this.getProject(this.props.params.id);
	  this.getTeams(this.props.params.id);
	}

	// componentDidMount() {
	// 	this.getTeams(this.props.params.id);
	// }

	getProject(id) {
		ghoulie.log('getting project...');
		actions.getProject(undefined, {id}).then(store => {

			// store returned is same as getStore().getState()
			ghoulie.log('got project', store);

			// map the project to state
			this.setState({
				loading: store.projectsModel.loading,
				project: store.projectsModel.project
			}, () => {

				// emit PROJECT_LOADED event for ghoulie test to use
				const project = store.projectsModel.project;
				ghoulie.emit('PROJECT_LOADED', project);

			});

		}).catch(function(e, store) {
			console.log('CAUGHT ERROR', e);
			debugger;
		});
	}

	getTeams(id) {
		ghoulie.log('getting teams...');
		actions.getTeams(undefined, {id}).then(store => {

			// store returned is same as getStore().getState()
			ghoulie.log('got Teams', store);

			// map the project to state
			this.setState({
				loading: store.teamsModel.loading,
				teams: store.teamsModel.teams
			}, () => {

				// emit PROJECT_LOADED event for ghoulie test to use
				const teams = store.teamsModel.teams;
				ghoulie.emit('TEAMS_LOADED', teams);

			});

		}).catch(function(e, store) {
			console.log('CAUGHT ERROR', e);
			debugger;
		});
	}

	render() {

		console.log('render proj',this.state.project);
		const subtitle = this.state.project !== null ? this.state.project.name : '';
		return (

			<Layout title={`Project ${subtitle}`}>
				{this.renderLoading()}
				<div id="page-teams" className="page">
				<RaisedButton
						target="_blank"
						label="Add Team"
						secondary={true}
						icon={<PlusIcon />}
						onTouchTap={::this.addTeam}
					/>
				{this.renderAddTeams()}
				{this.renderTeams()}
				</div>
			</Layout>
		);
	}



	renderLoading() {
		if (this.state.loading) {
			return (<div>Loading...</div>);
		}
	}

	renderTeams() {
		if (this.state.teams) {
			return (<Teams
				teams={this.state.teams}
				onTeamTouch={::this.onTeamTouch}
				onDownload={::this.onDownload} />);
		}
	}

	renderAddTeams() {
		if (this.state.openAddTeams) {
			return (
				<AddTeam
					close={::this.closeAddTeam}
					onSave={::this.onSave} />
			);
		}
	}

	onDownload(id) {
		ghoulie.log('Dowloading...');
		actions.downloadTeamProject(undefined, {id}).then(store => {
			ghoulie.log('got Teams', store);

			this.setState({
				downloading: store.teamsModel.dowloading
			}, () => {
				ghoulie.emit('TEAM_PROJECT_DOWNLOADED');
			}).catch(function(e, store) {
				console.log('CAUGHT ERROR', e);
				debugger;
			});
		});
	}

	addTeam() {
		this.setState({openAddTeams: true});
	}

	closeAddTeam() {
		this.setState({openAddTeams: false});
	}

	onSave() {
		this.closeAddTeam();
		
	}

	onTeamTouch(id) {
		console.log('opened team', id);
	}

	onDelete(id) {
		console.log('delete', id);
	}

 // @ TODO
	// onAdd() {
	//
  //   //  replaces current list with a form to insert Github URL and project title
  //   //  Toggle state between current project list display OR new project form
  //   //  Add one at a time for now
  //   getStore().dispatch(addProject());
	//
	// 	// const name = ReactDOM.findDOMNode(this.refs.project).value;
	// 	// nebulisActions.createProject({
	// 	// 	name
	// 	// }).then(store => {
	// 	// 	ReactDOM.findDOMNode(this.refs.project).value = '';
	// 	// 	this.getProjects();
	// 	// });
  //   console.log('adding project(s)...')
	// }

  //  retrive project info from github

  //  add project info to DB

  //  move project name from unadded list to added list

	//
	// onDelete(id) {
  //   //  destroys selected project(s) in DB by id
	// 	nebulisActions.deleteProject(null, {
	// 		id
  //     // then pulls updated list and replaces old list
	// 	}).then(::this.getProjects);
	// }
}
