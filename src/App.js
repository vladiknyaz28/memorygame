import './App.css';
import config from './config';
import React from "react";
import Card from "./components/Card";
import Popup from 'reactjs-popup';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      cards: [],
      clicks: 0,
      seconds: 0,
      isPopupOpened: false,
      bestResult: null
    };
  }

  componentDidMount() {
    const bestResult = JSON.parse(localStorage.getItem('memory-best-result'));
    this.setState({ bestResult });
    this.startGame();
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  startTimer = () => {
    clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      this.setState(prevState => ({
        seconds: prevState.seconds + 1
      }));
    }, 1000);
  }

  stopTimer = () => {
    clearInterval(this.timerId);
  }

  startGame = () => {
    this.setState({
      cards: this.prepareCards(),
      clicks: 0,
      seconds: 0,
      isPopupOpened: false
    }, () => {
      this.startTimer();
    });
  }

  prepareCards() {
    let id = 1;
    return [...config.cards, ...config.cards]
      .sort(() => Math.random() - 0.5)
      .map(item => ({ ...item, id: id++, isOpened: false, isCompleted: false }));
  }

  choiceCardHandler(openedItem) {
    if (openedItem.isCompleted || this.state.cards.filter(item => item.isOpened).length >= 2) {
      return;
    }

    this.setState(prevState => ({
      cards: prevState.cards.map(item =>
        item.id === openedItem.id ? { ...item, isOpened: true } : item
      ),
      clicks: prevState.clicks + 1
    }), () => {
      this.processChoosingCards();
    });
  }

  processChoosingCards() {
    const openedCards = this.state.cards.filter(item => item.isOpened);

    if (openedCards.length === 2) {
      if (openedCards[0].name === openedCards[1].name) {
        this.setState({
          cards: this.state.cards.map(item => {
            if (item.id === openedCards[0].id || item.id === openedCards[1].id) {
              return { ...item, isCompleted: true, isOpened: false };
            }
            return item;
          })
        }, () => {
          this.checkforAllCompleted();
        });
      } else {
        setTimeout(() => {
          this.setState({
            cards: this.state.cards.map(item => ({ ...item, isOpened: false }))
          });
        }, 1000);
      }
    }
  }

  checkforAllCompleted() {
    if (this.state.cards.every(item => item.isCompleted)) {
      this.stopTimer();

      const currentResult = {
        clicks: this.state.clicks,
        seconds: this.state.seconds
      };

      const previousBest = JSON.parse(localStorage.getItem('memory-best-result'));
      let bestResult = previousBest;

      if (
        !previousBest ||
        currentResult.clicks < previousBest.clicks ||
        (currentResult.clicks === previousBest.clicks && currentResult.seconds < previousBest.seconds)
      ) {
        bestResult = currentResult;
        localStorage.setItem('memory-best-result', JSON.stringify(currentResult));
      }

      this.setState({
        isPopupOpened: true,
        bestResult: bestResult
      });
    }
  }

  getGrade() {
    const { clicks, seconds } = this.state;

    if (clicks <= 12 && seconds <= 30) {
      return 'Отлично';
    }

    if (clicks <= 18 && seconds <= 60) {
      return 'Хорошо';
    }

    if (clicks <= 26 && seconds <= 90) {
      return 'Нормально';
    }

    return 'Можно лучше';
  }

  closePopup() {
    this.setState({
      isPopupOpened: false
    });
    this.startGame();
  }

  render() {
    return (
      <div className="App">
        <header className="header">Memory game</header>

        <div className="game">
          <div className="score">
            Нажатий: {this.state.clicks}
          </div>

          <div className="score">
            Время: {this.state.seconds} сек
          </div>

          <div className="cards">
            {
              this.state.cards.map(item => (
                <Card
                  item={item}
                  key={item.id}
                  isShowed={item.isOpened || item.isCompleted}
                  onChoice={this.choiceCardHandler.bind(this)}
                />
              ))
            }
          </div>
        </div>

        <Popup open={this.state.isPopupOpened} closeOnDocumentClick onClose={this.closePopup.bind(this)}>
          <div className="modal">
            <span className="close" onClick={this.closePopup.bind(this)}>
              &times;
            </span>

            <h2>Игра завершена!</h2>
            <p>Клики: {this.state.clicks}</p>
            <p>Время: {this.state.seconds} сек</p>
            <p>Оценка: {this.getGrade()}</p>

            {this.state.bestResult && (
              <p>
                Лучший результат: {this.state.bestResult.clicks} кликов, {this.state.bestResult.seconds} сек
              </p>
            )}
          </div>
        </Popup>
      </div>
    );
  }
}

export default App;