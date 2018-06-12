module AdminUsers exposing (..)

import Html as App
import Html exposing (Html, text)


type Msg
    = SearchUsers String
    | Error String


type alias Model =
    { users : List String
    , error : Maybe String
    }


main : Program Never Model Msg
main =
    App.program
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }


init : ( Model, Cmd Msg )
init =
    ( { users = [], error = Nothing }, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update action model =
    case action of
        SearchUsers query ->
            ( model, Cmd.none )

        _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    Html.main_
        []
        [ text "Hello world!" ]
