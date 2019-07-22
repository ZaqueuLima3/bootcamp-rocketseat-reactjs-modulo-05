import React, { Component } from 'react';
import { FaGithub, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    const data = localStorage.getItem('repos');

    if (data) {
      this.setState({ repositories: JSON.parse(data) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState !== repositories) {
      localStorage.setItem('repos', JSON.stringify(repositories));
    }
  }

  handleInputchange = e => {
    this.setState({ newRepo: [e.target.value] });
  };

  handleSubmit = async e => {
    try {
      e.preventDefault();

      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      if (!newRepo) {
        throw new Error('repository not defined');
      }

      const checkRepoExist = repositories.filter(repo => repo === newRepo);
      if (checkRepoExist) {
        throw new Error('duplicate repository');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch (err) {
      this.setState({
        error: true,
        loading: false,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error } = this.state;
    return (
      <Container>
        <h1>
          <FaGithub /> Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            name="newRepo"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputchange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;
