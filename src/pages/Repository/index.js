import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Filter, Owner, IssuseList, Pagination } from './styles';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    stateIssues: 'open',
    page: 1,
  };

  async componentDidMount() {
    await this.hanldeRepositoryData();
  }

  hanldeRepositoryData = async () => {
    const { match } = this.props;
    const { stateIssues, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: stateIssues,
          per_page: 10,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  handleIssuesStates = async state => {
    await this.setState({ stateIssues: state, page: 1 });
    await this.hanldeRepositoryData();
  };

  handlePagination = async newPage => {
    const { page, issues } = this.state;

    if (newPage === 'back' && page === 1) return;

    if (newPage === 'next' && issues.length < 10) return;

    await this.setState({
      page: newPage === 'back' ? page - 1 : page + 1,
    });

    await this.hanldeRepositoryData();
  };

  render() {
    const { repository, issues, loading, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Filter>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => this.handleIssuesStates('all')}
          >
            Todas
          </button>
          <button type="button" onClick={() => this.handleIssuesStates('open')}>
            Abertas
          </button>
          <button
            type="button"
            onClick={() => this.handleIssuesStates('closed')}
          >
            Fechadas
          </button>
        </Filter>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssuseList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url} target="_blank">
                    {issue.title}
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </a>
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuseList>
        <Pagination>
          <button type="button" onClick={() => this.handlePagination('back')}>
            Anterior
          </button>
          <span>{`Pagina: ${page}`}</span>
          <button type="button" onClick={() => this.handlePagination('next')}>
            Proximo
          </button>
        </Pagination>
      </Container>
    );
  }
}

export default Repository;
