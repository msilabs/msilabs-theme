@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    {{-- Blade comment --}}
    <x-alert type="info" :message="$message" />

    <form method="POST" action="{{ route('posts.store') }}">
        @csrf
        <input type="text" name="title" value="{{ old('title') }}">
    </form>

    @if ($posts->isEmpty())
        <p>No posts yet.</p>
    @else
        @foreach ($posts as $post)
            <article class="post">
                <h2>{{ $post->title }}</h2>
                {!! $post->body_html !!}
            </article>
        @endforeach
    @endif
@endsection
